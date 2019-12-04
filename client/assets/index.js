$(document).ready(async function(){
    // on load show login page
    if( !localStorage.session )
        location.href = "/login.html";
    
    const response = await $.post( '/api/chatroom/load', 
        { chatroom: localStorage.chatroom || '', session: localStorage.session } );
    console.log( 'response: ', response );

    if( response.status==0 ){
        console.log( `[api/chatroom/load] couldn't load, redirecting to login.` );
        location.href = "/login.html"; 
    }
    
    $('#user-thumbnail').attr('src', response.user.thumbnail || '' );
    $('#user-thumbnail').attr('class',response.user.status );
    $('#user-name').html( response.user.user );    
    $('#user-tagline').val( response.user.tagline || '' );
    $('#room-name').text( response.user.room );

    const user_id = response.user._id;
    localStorage._id = user_id;

    $('#room-users').empty();
    response.chatroomUsers.map( user => {
        if( user._id!==user_id )
        $('#room-users').append(`
        <li class="contact">
            <div class="wrap">
                <span class="contact-status ${user.status}"></span>
                <img src="${user.thumbnail}" alt="" />
                <div class="meta">
                    <p class="name">${user.name}</p>
                    <p class="preview">${user.tagline}</p>
                </div>
            </div>
        </li>
        `) 
        });

    $('#room-log').empty();
    response.chatLog.map( entry => {
        $('#room-log').append(`
        <li class="${(entry.user._id==user_id ? 'sent' : 'replies' )}">
            <img src="${entry.user.thumbnail}" alt="" />
            <p>${entry.message}</p>
            ${entry.attached ? 
                `<img class='attached-image' src='/assets/pics/${entry.attached}' />` : ''}
        </li>
        `);
    });

    $(".messages").animate({ scrollTop: $(document).height() }, "fast");
});

function messageFilePreview(){
    inputFilePreview('#inputfile','#pic-preview');
    $('#pic-preview').show();
    // hide preview after 2s
    setTimeout( ()=>{ $('#pic-preview').fadeOut(); }, 2000 );
}

async function sendMessage(event){
    if( event ) event.preventDefault();

    const response = await formSend('#messageData INPUT','/api/chatroom/message');
    console.log( `[sendMessage] response=`, response );
    if( response.status ){
        const message = $('#message-input').val();
        $('#message-input').val('');

        $('#room-log').append(`
        <li class="sent">
            <img src="${response.user.thumbnail}" alt="" />
            <p>${response.chatLog.message}</p>
            ${response.chatLog.attached ? 
            `<img class='attached-image' src='/assets/pics/${response.chatLog.attached}' />` : ''}
        </li>
        `);
        console.log( `.. appended message, now scrolling` );
        const msgDiv = document.querySelector(".messages");
        msgDiv.scrollTop = msgDiv.scrollHeight;
    };        
}

    
        
        $("#profile-img").click(function() {
            $("#status-options").toggleClass("active");
        });
        
        $(".expand-button").click(function() {
            $("#profile").toggleClass("expanded");
            $("#contacts").toggleClass("expanded");
        });
        
        $("#status-options ul li").click(function() {
            $("#profile-img").removeClass();
            $("#status-online").removeClass("active");
            $("#status-away").removeClass("active");
            $("#status-busy").removeClass("active");
            $("#status-offline").removeClass("active");
            $(this).addClass("active");
            
            if($("#status-online").hasClass("active")) {
                $("#profile-img").addClass("online");
            } else if ($("#status-away").hasClass("active")) {
                $("#profile-img").addClass("away");
            } else if ($("#status-busy").hasClass("active")) {
                $("#profile-img").addClass("busy");
            } else if ($("#status-offline").hasClass("active")) {
                $("#profile-img").addClass("offline");
            } else {
                $("#profile-img").removeClass();
            };
            
            $("#status-options").removeClass("active");
        });
        
       
        
        $(window).on('keydown', function(e) {
            if (e.which == 13) {
                sendMessage();
                return false;
            }
        });