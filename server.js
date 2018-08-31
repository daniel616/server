const express=require('express');
const socketIO=require('socket.io');
const http=require('http');
const Bump=require('./bastBump');
const worldEntities=require('./worldEntities');

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

    io.sockets.emit('newMessage',
        new generateMessage('ADMIN','A NEW USER HAS JOINED US'));
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
    //staticPlatforms.push(new worldEntities.Platform(0,100,60,500));
    //staticPlatforms.push(new worldEntities.Platform(WIDTH-60,100,60,800));
    staticPlatforms.push(new worldEntities.Platform(0,300,WIDTH,30));
    staticPlatforms.push(new worldEntities.Platform(200,550,WIDTH*0.75,30));
    let playerData=new worldEntities.Player(250,400,50,70);
    playerData.act=()=>playerAct(playerData);
    playerSpriteData["ai"]=playerData;
    dynamicEntities[playerData.id]= playerData;
}


function handleMoveCommands(player, commands) {
    let speed =25;
    if(commands.indexOf('87')!==-1){
        //jump
        player.vy=-GRAVITY*5;
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
    if(commands.indexOf('191')!==-1&&player.shootReady){
        let attack=new worldEntities.generatedProjectile(player,20,20,10,10000);
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
        }else{
            //TODO: Shield?
        }

        player.dashReady=false;
        setTimeout(()=>player.dashReady=true,player.dashCoolDown);
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
            delete dynamicEntities[projectileData.id];
            hitPlayer(projectileData.x,projectileData.y,projectileData.damage,baron);

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

const port=process.env.PORT||3000;

server.listen(port, ()=>{
    initializeWorld();
    console.log(`Server is up on port ${port}`);

    const update_interval = setInterval(update, UPDATE_INTERVAL_MS);
});
