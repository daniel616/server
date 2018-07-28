var playerSocket=io();
var keys=[];
var canvasContext=$('#gameArea').get(0).getContext('2d');

var worldInfoQueue;

var timeSinceRender=0;

var update_rate=20;



playerSocket.on('fetchCommands',(playerActionCallback)=>{
    playerActionCallback(fetchPlayerActions());
});


window.addEventListener('keydown',
    function(e){
        keys[e.keyCode]=true;
    });

window.addEventListener('keyup',
    function(e){
        keys[e.keyCode]=false;
    });

function render(updatedWorld){
    canvasContext.fillStyle='#DDDDDD';
    canvasContext.fillRect(0,0,300,300);

    for (var player in updatedWorld.players){
            canvasContext.fillStyle='#5000ff';
            var x= updatedWorld.players[player].x;
            var y=updatedWorld.players[player].y;
            canvasContext.fillRect(x-20,y-20,40,40);
    }
}

function fetchPlayerActions(){
    var pressedKeys=[];
    for(variable in keys) {
        if(keys[variable]===true){
            pressedKeys.push(variable.toString());
        }
    }

    return pressedKeys;
}


function update(){
    playerSocket.emit('getWorldInfo',render);
}

function getLatency(){
    var currentTime=new Date();
    playerSocket.emit('Ping',function(){
        var newTime = new Date();
        var message='Latency: '+(newTime-currentTime);
        console.log(newTime);
        console.log(currentTime);
        $('#latency').get(0).innerHTML=message;
        console.log('we');
    });
}



const latency_interval= setInterval(getLatency,1000);
const update_interval = setInterval(update, 1000/update_rate);

//constUpdate(0.05);