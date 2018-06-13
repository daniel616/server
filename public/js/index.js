var socket=io();

socket.on('connect',()=>{
    console.log('Connected to server');

    socket.emit('createMessage',{
        from:'dan@',
        text:'Hey, I just met you'
    });
});

socket.on('disconnect',()=>{
    console.log('Client disconnected from server');
});

socket.on('newMessage', function(message){
    console.log('New message:',message);
});


