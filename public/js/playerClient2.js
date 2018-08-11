var playerSocket=io();

var timeSinceRender=0;

var update_rate=10;

var userName='DIO';

playerSocket.on('fetchCommands',(playerActionCallback)=>{
    playerActionCallback(fetchPlayerActions());
});

playerSocket.emit('getMessageHistory',function(){

});

playerSocket.on('newMessage',(message)=>{
    renderMessage(message);
});

function render(updatedWorld){
    for (var player in updatedWorld.players){
            var x= updatedWorld.players[player].x;
            var y=updatedWorld.players[player].y;
            canvasContext.fillRect(x-20,y-20,40,40);
    }
}

function update(){
    playerSocket.emit('getWorldInfo',render);
}

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
const update_interval = setInterval(update, 1000/update_rate);

//constUpdate(0.05);