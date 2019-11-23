# Initial Vision
With a goal of an immersive interactive application that everyone can relate to; and that is not too complicated to build, the thought of a chat application appeared. We could add PWA capabilities to it for a meaningful demostration of offline usage, and people could engage others in class which makes it more compelling.

So then the question - what features and which tools?

# Features
People register with a name + profile picture. They then login to a one of multiple rooms and can chat to others.

Want to demostrate easy usage of pre-built bootstrap themes, thus choosing one.

# Serverside MVP
- Serve static content
- Listen to socket communication and broadcast to corresponding chat-room
- API Endpoints:
   * register (saves email, name, password, birthday, thumbnail)
   * login (validates email + password and logs into lobby)
   * chatrooms (gives list of chatrooms)
- SOCKET Endpoints:
   * join room
      ~ marks user in a room
      ~ sends a list of users in this room
   * write message to room
      ~ writes message to db (sender, timestamp)
   * leave room
      ~ marks user out of room

# Client MVP (Phase 1)
- Login page (email + password)
- Register page Wizard (name, email, password, birthday | picture | complete congrats page)
- Chatroom (names on left, chatroom dropdown top, then iMessage like chat-ui with emoticon, picture + text input at bottom)

# Client MVP (Phase 2)
- Add PWA to allow chat messaging while offline (disable pic upload?)
- Cache pics, active chatroom dialog

# JOURNEY Begins
- Nice UIs exist and so want to minimize building custom elements, no point for a generic app like this. Will focus around bootstrap enhancements.
- googled "bootstrap chat app free template" and found:
    https://bootsnipp.com/tags/chat
- googled "bootstrap template free admin" and found:
    https://colorlib.com/polygon/gentelella/index.html

That should cover most the hard-work for UI.

For server, socket.io seems to cover channels (ie for chatrooms), and websocket communications.

The rest we have to build!