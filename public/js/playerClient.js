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
    console.log('updatedrender');
    canvasContext.fillStyle='#DDDDDD';
    canvasContext.fillRect(0,0,300,300);
    console.log(JSON.stringify(updatedWorld.players,undefined,2));

    for (var player in updatedWorld.players){
        console.log(JSON.stringify(player,undefined,2));
        //if(updatedWorld.players.hasOwnProperty(player)){
            canvasContext.fillStyle='#5000ff';
            var x= updatedWorld.players[player].x;
            var y=updatedWorld.players[player].y;
            canvasContext.fillRect(x-20,y-20,40,40);
       // }




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


function constUpdate(dt) {
    playerSocket.emit('getWorldInfo',render);
    setTimeout(() => {
        constUpdate(dt)
    }, 1000*dt);
}

function update(){
    playerSocket.emit('getWorldInfo',render);
}

const update_interval = setInterval(update, 1000 / update_rate);
//constUpdate(0.05);