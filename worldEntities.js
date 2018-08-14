function Player(playerName) {
    this.playerName = playerName;
    this.x = 0;
    this.y = 0;
    this.vy= 0;
    this.vx=0;
    this.width=20;
    this.height=50;
}

function handleMoveCommands(player, commands) {
    var speed =5;
    if(commands.indexOf('87')!==-1){
        player.y-=5;
    }
    if(commands.indexOf('83')!==-1){
        player.y+=5;
    }
    if(commands.indexOf('68')!==-1){
        player.x+=5;
    }
    if(commands.indexOf('65')!==-1){
        player.x-=5;
    }
}

function Platform(x,y,width,height){
    this.x=x;
    this.y=y;
    this.width=width;
    this.height=height;
}

module.exports={Player,handleMoveCommands,Platform};