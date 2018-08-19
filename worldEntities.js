const idGenerator={
    currentID:0,
    generateID:function(){
        this.currentID++;
        return this.currentID;
    }
}

/*
const refreshNotifier={
    value:[],
    needsRefresh:function(){
        let oldValue=this.value;
        this.value=[];
        return oldValue;
    }
}*/

function SpriteData(x,y,width,height,renderKey){
    return {id:idGenerator.generateID(),x,y,width,height,renderKey};
}

function Platform(x,y,width,height){
    return SpriteData(x,y,width,height,'platform');
}

function Player(x,y,width,height){
    let player=SpriteData(x,y,width,height,'player');
    player.health=10;
    player.cooldown=0;
    player.COOLDOWN_INTERVAL=1000;
    return player;
}

function generatedProjectile(player, width, height, longevity){
    let attack=SpriteData(player.x,player.y,width,height,'projectile');
    attack.longevity=longevity;
    attack.attackerID=player.id;
    return attack;
}

module.exports={Player,Platform, generatedProjectile};