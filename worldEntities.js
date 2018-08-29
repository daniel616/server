const idGenerator={
    currentID:0,
    generateID:function(){
        this.currentID++;
        return this.currentID;
    }
};

function SpriteData(x,y,width,height,renderKey){
    let data={id:idGenerator.generateID(),x,y,width,height,renderKey};
    data.act=undefined;
    return data;
}

function Platform(x,y,width,height){
    return SpriteData(x,y,width,height,'platform');
}

function Player(x,y,width,height){
    let player=SpriteData(x,y,width,height,'player');
    player.direction="right";
    player.renderStatus="neutral";
    player.health=10;
    player.shootReady=true;
    player.slashReady=true;
    player.dashReady=true;
    player.slashCoolDown=750;
    player.shootCoolDown=1000;
    player.dashCoolDown=1000;
    player.dashSpeed=75;
    player.anchor={
        x:0.5,
        y:0.5,
    };
    player.vx=0;
    player.vy=0;
    return player;
}

function generatedProjectile(player, width, height, damage,longevity){
    let attack=SpriteData(player.x,player.y,width,height,'projectile');
    attack.longevity=longevity;
    attack.attackerID=player.id;
    attack.speed=20;
    attack.damage=damage;
    attack.renderStatus="neutral";
    return attack;
}

module.exports={Player,Platform, generatedProjectile};