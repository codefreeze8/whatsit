// Written by Filipe Laborde, Nov 2019
// MIT License - use as you wish!
//
// we are using socket.io to add reconnection logic & namespaces
// see: https://socket.io/docs/
// namespaces: https://socket.io/docs/rooms-and-namespaces/#Namespaces

const express = require("express");
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const mongoose = require("mongoose");
const passwordHash = require('password-hash');
const multer = require('multer'); // for image-upload
const uuidv4 = require('uuid/v4');


const PORT = process.env.PORT || 3000

// config express 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app-facing data served from
app.use(express.static("client"));

// for image uploading we use multer middle-ware.
const Resize = require('./Resize');
const upload = multer({ limits: { fileSize: 50000000 } });

// for the websocket we also need to explicitly listen to 80.
server.listen(PORT);
// WARNING: app.listen(PORT) not needed, it will not allow the websocket layer

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/whatsthat", {
  useNewUrlParser: true,
  useFindAndModify: false
});
const db = require("./models");


// Register the user (if new/unique) and save picture to system (if exists)
app.post('/api/register', upload.single('pic'), async function (req, res) {
  console.log( `[POST register] registered user` );
  try {
    let filename = '_profile.png';
    if( req.file ){
      // picture attached, resize it and save it for this user
      console.log( `~ pic attached (pic: ${req.file.originalname}/${req.file.size}) ` );
      const fileUpload = new Resize({ 
        path: '/client/assets/pics', 
        size: '300x300',
        filename: `${uuidv4()}.jpg` });
      filename = await fileUpload.save(req.file.buffer);
    }
    
    const userData = {
      name: req.body.name,
      email: req.body.email,
      // hash the password to prevent us from knowing actual user password
      password: passwordHash.generate(req.body.password),
      thumbnail: `/assets/pics/${filename}`,
      status: 'online',
      tagline: req.body.tagline,
      // room+session are adjusted when they login, defaults
      room: 'Lobby',
      session: uuidv4() // give an initial unique session.
    }
    const dbUser = await db.User.create( userData );
    dbUser.password = "";
    res.send( { status: 1, user: userRoomInfo(dbUser) } );

  } catch( error ){
    res.send( { status: 0, error: error.message } );
  }
});


// login user if valid password, pass back the userId + room
app.post('/api/login', async function (req, res) {
  console.log( `[GET login] check user valid`, req.body );
  const dbUser = await db.User.findOne({ email: req.body.email });

  if( !dbUser || !passwordHash.verify( req.body.password, dbUser.password ) ){
    console.log( `x sorry invalid password (${req.body.password}), failing.` );
    return res.send({ status: 0, error: "Invalid login, try again" });
  }
  
  // add session to this user
  const session = uuidv4();
  console.log( `* valid login attempt, generated session: ${session}` );
  const result = await db.User.updateOne({ _id: dbUser._id }, { session });
  if( !result.ok ) throw new Error( 'User update error (for session)' );

  // adjust user-info, add session, and clear password before passing back
  dbUser.session = session;
  dbUser.password = "";
  console.log( `.. user login complete sending bsck the uder data `, { status: 1, user: dbUser } );

  res.send( { status: 1, user: userRoomInfo(dbUser) } );
});


// insert an initial chat message so there's an entry to room
app.post('/api/chatroom/load', async function (req, res) {
  const session = req.body.session || '';
 
  console.log( `[GET chatroom/load] loading room; session='${session}` );
  if( !session || session.length !== 36 ){
    // invalid session going back to login page
    console.log( `x invalid login, sending response rejecting it.` );
    return res.send( { status: 0, error: "Invalid session" } );
  }

  try { 
    let dbUser = await db.User.findOne({ session });
    console.log( `~ user (${dbUser.name}) has session(${dbUser.session})` );
    const room = req.params.room || dbUser.room;
    let result;

    let newChatLog = { 
      room, 
      message: req.params.message || '', 
      user: dbUser._id
    };

    // check chatroom exists
    let dbChatroom = await db.Chatroom.findOne({ room });
    if( !dbChatroom || !dbChatroom._id ){
      console.log(`+ creating chatroom '${room}', x dbChatroom was:`, dbChatroom );
      // didn't exist, create it, add message, and swap user into it
      dbChatroom = await db.Chatroom.create({ room });
      newChatLog.message = `Welcome to ${room}`;
    }
    
    // add message to the log (if msg exists)
    if( newChatLog.message.length )
      result = await db.Chatlog.create( newChatLog );

    console.log( `+updating user session to chatroom ${newChatLog.room} for user: ${dbUser._id}` );
    result = await db.User.updateOne({ _id: dbUser._id }, { $set: { room } });
    if( !result.ok ) throw new Error( 'User update error' );

    // notify everyone (else) this person joined the chatroom
    io.sockets.emit('broadcast',`chatroom:${room}`, { action: 'joined', user: userRoomInfo(dbUser) });

    // get active chatroom participants (ie have a session too)
    const chatroomUsers = !dbChatroom._id ? [] : 
      await db.User.find({ room, $where: "this.session.length == 36" }, 'name thumbnail status tagline').sort({ name: 1 }); 
    console.log( ` -> users in chatroom: `, chatroomUsers );

    // get latest 50 chats for this room
    const chatLog = !dbChatroom._id ? [] :
      await db.Chatlog.find({ room }).populate('user', 'name thumbnail status tagline').sort({ date: 1 });
    console.log( ` -> chatlog for the room:`, chatLog );

    return res.send( { status: 1, chatroomUsers, chatLog, user: userRoomInfo(dbUser) } );

  } catch( error ){
    console.log( `x problems logging in: '${error.message}', forcing return to login screen.`)
    res.send( { status: 0, error: error.message } );
  }    
});

 
app.post('/api/chatroom/message', upload.single('pic'), async function (req, res) {
  console.log( `[POST chatroom/message] posted message` );
  const session = req.body.session || '';
  const message = req.body.message || '';
  
  try {
    if( session.length!==36 ) throw new Exception( 'Invalid session' );
    if( !req.file && !message ) throw new Exception( 'Empty message' );

    let dbUser = await db.User.findOne({ session });
    let attached = '';
    if( req.file ){
      // picture attached, resize it and save it for this user
      console.log( `~ pic attached (pic: ${req.file.originalname}/${req.file.size}) ` );
      const fileUpload = new Resize({ 
        path: '/client/assets/pics', 
        size: '800x800',
        filename: `${uuidv4()}.jpg` });
        attached = await fileUpload.save(req.file.buffer);
    }
    
    const newChatLog = {
      room: dbUser.room, 
      message, attached, 
      user: dbUser._id
    }
    const dbChatLog = await db.Chatlog.create( newChatLog );

    res.send( { status: 1, user: userRoomInfo(dbUser), chatLog: dbChatLog } );

  } catch( error ){
    console.log( `x sorry error: ${error.message}` );
    res.send( { status: 0, error: error.message } );
  }
});

// Switch user between chatrooms
// session: user session | chatroom: old chatroom | gotoChatroom: new chatroom
app.get('/api/chatroom', async function (req, res) {
  // switch this users chatroom
  if( !req.params.session || req.params.session.length !== 32 ){
    res.send({ status: 0, error: "Invalid session, login again" });
  }

  let dbUser = await db.User.updateOne({ session: req.params.session }, 
    { chatroom: req.params.gotoChatroom });
  console.log( `~ updated user to the new chatroom.`, dbUser );

  // announce to new chatroom & old chatroom
  io.sockets.emit('broadcast',`chatroom:${gotoChatroom}`, { action: 'joined', 
              user: userRoomInfo(dbUser) } );
  io.sockets.emit('broadcast',`chatroom:${chatroom}`, { action: 'left', 
              user: userRoomInfo(dbUser) });
  res.send( { status: 1, user: userRoomInfo(dbUser), chatroomUsers } );
});


app.post("/api/transaction", async (req, res) => {
  console.log( `[POST transaction]`, req );
  const dbTransaction = await ChatLog.create(body);
  res.json(dbTransaction);
});

app.post("/api/transaction/bulk", async ({ body }, res) => {
  console.log( `[POST transaction/bulk]`, body );
  // mongo uses _id as it's unique-key, it DROPS/IGNORES the 'id' sent to it
  // so we have to gather those id elements 
  const dbTransaction = await ChatLog.insertMany(body);

  let offlineIds = [];
  for( let tx of dbTransaction )
  offlineIds.push( tx.offlineId );

  console.log( ` sending back offlineIds: `, offlineIds );

  // push back the list of offlineId's that we have sync'd.
  res.send({offlineIds: offlineIds});
});

app.get("/api/transaction", async (req, res) => {
  const dbTransaction = await ChatLog.find({}).sort({ date: -1 });
  console.log( `[GET transaction] listing all transactions`, dbTransaction );
  res.json(dbTransaction);
});


// on new connection from a clients, send them an initialization
io.on('connection', function (socket) {
  io.sockets.emit('broadcast','news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

 
// general functions used ----------------------
function userRoomInfo( user ){
  return { 
    _id: user._id, 
    user: user.name, 
    thumbnail: user.thumbnail,
    status: user.status,
    tagline: user.tagline,
    room: user.room,
    session: user.session
  };
}
