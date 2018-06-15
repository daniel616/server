var playerSocket=io();
var keys=[];
var canvasContext=$('#gameArea').get(0).getContext('2d');



playerSocket.on('update',(updatedWorld, playerActionCallback)=>{
    console.log(JSON.stringify(updatedWorld,undefined,2));
    render(updatedWorld);
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
    console.log('updatedrender')
    canvasContext.fillStyle='#DDDDDD';
    canvasContext.fillRect(0,0,300,300);
    consaole.log(JSON.stringify(updatedWorld.players,undefined,2));

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