function Player(playerName) {
        this.playerName = playerName,
        this.x = 0,
        this.y = 0,
        this.move = function (commands) {
            handleMoveCommands(this,commands);
        }
}

function handleMoveCommands(player, commands) {

    if(commands.indexOf('87')!=-1){
        player.y+=1;
    }
    if(commands.indexOf('83')!=-1){
        player.y-=1;
    }
    if(commands.indexOf('68')!=-1){
        player.x+=1;
    }
    if(commands.indexOf('65')!=-1){
        player.x-=1;
    }
    console.log(`${player.x},${player.y}`);
}

module.exports={Player};