function Player(playerName) {
    this.playerName = playerName;
    this.x = 0;
    this.y = 0;
    this.vy= 0;
    this.vx=0;
    this.health=10;
    this.width=50;
    this.height=70;
    this.timeSinceAttack=0;
}

function Platform(x,y,width,height){
    this.x=x;
    this.y=y;
    this.width=width;
    this.height=height;
}

function attack(x,y,width,height,sourceID,existTime){
    this.x=x;
    this.y=y;
    this.width=width;
    this.height=height;
    this.sourceID=sourceID;
    this.existTime=existTime;


}

module.exports={Player,Platform};