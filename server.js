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

const HEIGHT=600;
const WIDTH=900;
const HEALTH_MAX=10;
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
        let ID=playerSpriteData[socket.id].id;
        delete dynamicEntities[ID];
        delete playerSockets[socket.id];
        delete playerSpriteData[socket.id];
    });

    socket.on('Ping',(callback)=>{
        callback();
    });

    io.sockets.emit('newMessage',
        new generateMessage('ADMIN','A NEW USER HAS JOINED US'));
});

function generateMessage(from,text){
    this.from=from;
    this.text=text;
}

function respawnPlayer(playerData){
    playerData.health=HEALTH_MAX;

    let xPos=spawnLeft ? 0:WIDTH-playerData.width;
    playerData.x=xPos;
    playerData.y=10;
    spawnLeft=!spawnLeft;
}

function initializeWorld(){
    staticPlatforms.push(new worldEntities.Platform(0,100,60,500));
    staticPlatforms.push(new worldEntities.Platform(WIDTH-60,100,60,800));
    staticPlatforms.push(new worldEntities.Platform(200,400,500,30));
}

function update(dt){
    Object.keys(playerSockets).forEach(function(key,index){
        let socket=playerSockets[key];
        let player=playerSpriteData[key];

        socket.emit('worldInfo',{dynamicEntities});
        socket.emit('fetchCommands', function(playerAction){
            handleMoveCommands(player,playerAction);
        });
    });

    Object.keys(dynamicEntities).forEach(function(key,index){
        if(dynamicEntities[key].act!==undefined){
            dynamicEntities[key].act();
        }
    });
}

function handleMoveCommands(player, commands) {
    var speed =25;
    if(commands.indexOf('87')!==-1){
        player.vy=-speed;
    }
    if(commands.indexOf('83')!==-1){
        player.vy=speed;
    }
    if(commands.indexOf('68')!==-1){
        player.vx=speed;
    }
    if(commands.indexOf('65')!==-1){
        player.vx=-speed;
    }
    if(commands.indexOf('75')!==-1&&player.cooldown<=0){
        let attack=new worldEntities.generatedProjectile(player,20,20,10,10000);
        attack.vx=5;
        attack.vy=5;
        dynamicEntities[attack.id]=attack;

        attack.act= ()=>projectileAct(attack);

        setTimeout(function(){
            if(dynamicEntities[attack.id]){
                delete dynamicEntities[attack.id];
            }
        },attack.longevity);
        //player.cooldown=player.COOLDOWN_INTERVAL;
    }
}

function projectileAct(projectileData){
    projectileData.x+=projectileData.vx;
    projectileData.y+=projectileData.vy;
    Object.keys(playerSpriteData).forEach(function(key,index){
        if(Bump.hitTestRectangle(projectileData,playerSpriteData[key])){
            delete dynamicEntities[projectileData.id];
            playerSpriteData[key].health-=projectileData.damage;
        }
    });
}

function playerAct(playerData){
    playerData.x+=playerData.vx;
    playerData.y+=playerData.vy;

    playerData.vy+=4;
    playerData.vy*=0.9;
    playerData.vx*=0.9;
    for(let i=0;i<staticPlatforms.length;i++){
        Bump.rectangleCollision(playerData,staticPlatforms[i]);
    }

    if(playerData.health<=0){
        respawnPlayer(playerData);
    }
}

const port=process.env.PORT||3000;

server.listen(port, ()=>{
    initializeWorld();
    console.log(`Server is up on port ${port}`);

    const update_interval = setInterval(update, UPDATE_INTERVAL_MS);
});
