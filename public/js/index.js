

var socket=io();

io.on('connect',()=>{
    console.log('Connected to server');
});

socket.on('disconnect',()=>{
    console.log('Client disconnected from server');
});

socket.on('newMessage', function(message){
    console.log('New message:',message);

    $('#messages')
        .append($('<li>').text(`${message.from}:${message.text}`))
});


$('#message-form').on('submit',function(e){
    e.preventDefault();

    socket.emit('createMessage',{
        from:'daniel',
        text:$('[name=message]').val()
    })
});



