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
    player.health=10;
    player.cooldown=0;
    player.COOLDOWN_INTERVAL=1000;
    player.vx=0;
    player.vy=0;
    return player;
}

function generatedProjectile(player, width, height, damage,longevity){
    let attack=SpriteData(player.x,player.y,width,height,'projectile');
    attack.longevity=longevity;
    attack.attackerID=player.id;
    attack.damage=damage;
    return attack;
}

module.exports={Player,Platform, generatedProjectile};