function Player(playerName,socketID) {
    this.playerName = playerName;
    this.socketID =socketID;
    this.x = 0;
    this.y = 0;
    this.move = function (commands) {
        handleMoveCommands(this,commands);
    };
}

function handleMoveCommands(player, commands) {
    var speed =5;
    if(commands.indexOf('87')!==-1){
        player.y-=speed;
    }
    if(commands.indexOf('83')!==-1){
        player.y+=speed;
    }
    if(commands.indexOf('68')!==-1){
        player.x+=speed;
    }
    if(commands.indexOf('65')!==-1){
        player.x-=speed;
    }
}

module.exports={Player};