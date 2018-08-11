let playerSocket=io();


playerSocket.emit('getMessageHistory',function(){

});

playerSocket.on('newMessage',(message)=>{
    renderMessage(message);
});


function getLatency(){
    var currentTime=new Date();
    playerSocket.emit('Ping',function(){
        var newTime = new Date();
        var message='Latency: '+(newTime-currentTime)+'ms';
        $('#latency').get(0).innerHTML=message;
    });
}

function sendMessage(){
    var text= $('#message').val();
    if(text.length==0||text.length>250){
        return;
    }

    playerSocket.emit('createMessage',{
        from:userName,
        text:text
    });
    $('#message').val('');
}

function renderMessage(message){
    var formattedText=message.from+ ': '+ message.text;
    $('#previousMessages').append($('<li>').text(formattedText));
}



const latency_interval= setInterval(getLatency,1000);