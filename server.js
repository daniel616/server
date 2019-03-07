const express=require('express');
const socketIO=require('socket.io');
const http=require('http');
const Bump=require('./bastBump');
const worldEntities=require('./worldEntities');
const initEntities=require('./initEntities');

let app=express();
let server = http.createServer(app);
let io=socketIO(server);

let playerSockets={};
let playerSpriteData={};

let staticPlatforms=[];
let dynamicEntities={};

const FRICTION=0.8;
const GRAVITY=4;
const HEIGHT=600;
const WIDTH=900;
const HEALTH_MAX=100;
let spawnLeft=true;

app.use(express.static(__dirname+'/public'));

const UPDATE_INTERVAL_MS=100;
const METEOR_INTERVAL_MS=10000;

io.on('connection',(socket)=>{
    socket.on('handShake',(callback)=>{
        console.log('New user connected: '+socket.id);
        let playerData=new worldEntities.Player(0,0,50,70);
        respawnPlayer(playerData);
        playerData.act=()=>playerAct(playerData);

        playerSockets[socket.id]=socket;
        playerSpriteData[socket.id]=playerData;
        dynamicEntities[playerData.id]= playerData;

        console.log(JSON.stringify(playerData));
        callback({staticPlatforms});
    });

    socket.on('createMessage',(message)=>{
        io.sockets.emit('newMessage',
            new generateMessage(message.from,message.text));
    });

    socket.on('disconnect',()=>{
        if(playerSockets[socket.id]){
            let ID=playerSpriteData[socket.id].id;
            delete dynamicEntities[ID];
            delete playerSockets[socket.id];
            delete playerSpriteData[socket.id];
        }else{
            console.log('Disconnected a client that connected before server restart... I think.');
        }
    });

    socket.on('Ping',(callback)=>{
        callback();
    });

    socket.broadcast.emit('newMessage', new generateMessage('ADMIN', 'someone has joined'));

    socket.emit('newMessage',
        new generateMessage('ADMIN','Press "," to phase through walls'));
});

function update(dt){
    Object.keys(playerSockets).forEach(function(key,index){
        let socket=playerSockets[key];
        let player=playerSpriteData[key];

        socket.emit('worldInfo',{dynamicEntities});
        player.renderStatus="neutral";//TODO: Remove this hack
        socket.emit('fetchCommands', function(playerAction){
            handleMoveCommands(player,playerAction);
            for(let i=0;i<staticPlatforms.length;i++){
                Bump.rectangleCollision(player,staticPlatforms[i]);
            }
        });
    });

    Object.keys(dynamicEntities).forEach(function(key,index){
        if(dynamicEntities[key].act!==undefined){
            dynamicEntities[key].act();
        }
    });
}

function generateMessage(from,text){
    this.from=from;
    this.text=text;
}

function respawnPlayer(playerData){
    playerData.health=HEALTH_MAX;

    playerData.x=spawnLeft ? 200:WIDTH-200;
    playerData.y=10;
    playerData.vy=0;
    playerData.vx=0;
    playerData.direction=spawnLeft? "right":"left";
    spawnLeft=!spawnLeft;
}

function initializeWorld(){
    initEntities.startingEntities().forEach(function (entity) {
        staticPlatforms.push(entity);
    });
    let playerData=new worldEntities.Player(250,400,50,70);
    playerData.act=()=>playerAct(playerData);
    playerSpriteData["ai"]=playerData;
    dynamicEntities[playerData.id]= playerData;
}


function handleMoveCommands(player, commands) {
    let speed =25;

    if(commands.indexOf('16')!==-1){
        speed=50;
    }else{
        speed=25;
    }

    if(commands.indexOf('191')!==-1&&player.shootReady){
        let attack=new worldEntities.playerProjectile(player,20,20,10,10000);
        if(player.direction==="right"){
            attack.vx=attack.speed;
        }else if(player.direction==="left"){
            attack.vx=-attack.speed;
        }
        attack.vy=0;
        dynamicEntities[attack.id]=attack;

        attack.act= ()=>projectileAct(attack);

        setTimeout(function(){
            if(dynamicEntities[attack.id]){
                delete dynamicEntities[attack.id];
            }
        },attack.longevity);

        player.shootReady=false;
        player.renderStatus="shoot";
        setTimeout(()=>player.shootReady=true,player.shootCoolDown);
        //player.cooldown=player.COOLDOWN_INTERVAL;
    }
    if(commands.indexOf('188')!==-1&&player.dashReady){
        let xDir=0,yDir=0;
        if(commands.indexOf('68')!==-1) xDir=1;
        if(commands.indexOf('65')!==-1) xDir=-1;
        if(commands.indexOf('83')!==-1) yDir=1;
        if(commands.indexOf('87')!==-1) yDir=-1;

        if(xDir!==0||yDir!==0){
            player.x+=xDir*player.dashSpeed;
            player.y+=yDir*player.dashSpeed;
            player.dashReady=false;
            setTimeout(()=>player.dashReady=true,player.dashCoolDown);
        }else{
            //TODO: Shield?
        }
    }
    if(commands.indexOf('190')!==-1&&player.slashReady){
        let xDisp=player.width/2;
        switch(String(player.direction)){
            case "left":
                xDisp*=-1;
                break;
            case "right":
                break;
        }
        let rectangle={x:player.x+xDisp,y:player.y,width:player.width/4,height:player.height*1.2};
        rectangle.anchor={x:0.5,y:0.5};
        //console.log('SLASH!'+JSON.stringify(point));
        Object.keys(playerSpriteData).forEach(function(key,index){
            if(playerSpriteData[key]!==player&&Bump.hitTestRectangle(rectangle,playerSpriteData[key])){

                hitPlayer(player.x,player.y,20,playerSpriteData[key]);
            }
        });

        player.renderStatus="slash";
        player.slashReady=false;

        setTimeout(()=>{
            player.slashReady=true;
        },player.slashCoolDown);

    }

    if(commands.indexOf('87')!==-1){
        //jump
        let jumpRect={};
        jumpRect.width=player.width;
        jumpRect.height=10;
        jumpRect.anchor={x:0.5,y:0.5};
        jumpRect.x=player.x;
        jumpRect.y=player.y+player.height/2;

        let jumpReady=false;

        Object.keys(staticPlatforms).forEach(function(key,index){
            if(Bump.hitTestRectangle(jumpRect,staticPlatforms[key])){
                jumpReady=true;
            }
        });

        if(jumpReady){
            player.vy=-GRAVITY*7;
        }
    }
    if(commands.indexOf('83')!==-1){
        //crouch?
        player.y+=speed;
    }
    if(commands.indexOf('68')!==-1){
        player.x+=speed;
        player.vx=Math.max(player.vx,0);
        player.direction="right";
    }
    if(commands.indexOf('65')!==-1){
        player.x-=speed;
        player.vx=Math.min(player.vx,0);
        player.direction="left";
    }
}

function hitPlayer(xSource,ySource,damage,player){
    //taken from https://stackoverflow.com/questions/3592040/javascript-function-that-works-like-actionscripts-normalize1
    function normalize(p,len) {
        if((p.x === 0 && p.y === 0) || len === 0) {
            return {x:0, y:0};
        }
        var angle = Math.atan2(p.y,p.x);
        var nx = Math.cos(angle) * len;
        var ny = Math.sin(angle) * len;
        return {x:nx, y:ny};
    }

    player.health-=damage;
    let blastVector=normalize({x:player.x-xSource,y:player.y-ySource},damage*3);
    player.vx+=Math.round(blastVector.x);
    player.vy+=Math.round(blastVector.y);

}

function projectileAct(projectileData){
    projectileData.x+=projectileData.vx;
    projectileData.y+=projectileData.vy;
    Object.keys(playerSpriteData).forEach(function(key,index){
        let baron=playerSpriteData[key];
        if(Bump.hitTestRectangle(projectileData,baron)
            &&baron.id!==projectileData.attackerID){

            hitPlayer(projectileData.x,projectileData.y,projectileData.damage,baron);
            if(dynamicEntities.hasOwnProperty(projectileData.id)){
                delete dynamicEntities[projectileData.id];
            }

        }
    });
    Object.keys(staticPlatforms).forEach(function(key,index){
        if(Bump.hitTestRectangle(projectileData,staticPlatforms[key])){
            delete dynamicEntities[projectileData.id];
        }
    });
}

function playerAct(playerData){
    playerData.x+=playerData.vx;
    playerData.y+=playerData.vy;

    playerData.vy+=GRAVITY;
    for(let i=0;i<staticPlatforms.length;i++){
        //TODO:function implicitly does two things
        if(Bump.rectangleCollision(playerData,staticPlatforms[i])){
            playerData.vy*=FRICTION;
            playerData.vx*=FRICTION;
        }
    }

    if(Math.abs(playerData.vx)<1){
        playerData.vx=0;
    }
    if(Math.abs(playerData.vy)<1){
        playerData.vy=0;
    }

    if(playerData.health<=0||playerData.x<-100||playerData.x>WIDTH+100||playerData.y<-100||playerData.y>HEIGHT+100){
        respawnPlayer(playerData);
    }

    //console.log('playerData: '+JSON.stringify(playerData));

}

function meteorHandler(){
    function randMeteor(){
        let x=Math.floor(Math.random()*WIDTH);
        let vx=Math.floor((0.5-Math.random())*10);
        let size=Math.floor(Math.random()*50+25);
        let vy=Math.floor(Math.random()*10)+10;
        let meteor = new worldEntities.generatedProjectile(x,0,size,size, size/2, 20);
        meteor.act=()=>projectileAct(meteor);
        meteor.vy=vy;
        meteor.vx=vx;
        dynamicEntities[meteor.id]=meteor;
    }
    for(let i=0;i<5;i++){
        randMeteor();
    }
}



const port=process.env.PORT||3000;

server.listen(port, ()=>{
    initializeWorld();
    console.log(`Server is up on port ${port}`);

    const update_interval = setInterval(update, UPDATE_INTERVAL_MS);
    //const meteor_interval = setInterval(meteorHandler,METEOR_INTERVAL_MS);
});
