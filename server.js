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
    //let needsRefresh=worldEntities.refreshNotifier.needsRefresh();
    for(let socketID in playerSockets){
        if(playerSockets.hasOwnProperty(socketID)&&playerSpriteData.hasOwnProperty(socketID)){
            const individualSocket=playerSockets[socketID];
            const individualData=playerSpriteData[socketID];

            //playerDataCollection[socketID]

            individualSocket.emit('fetchCommands', function(playerAction){
                handleMoveCommands(individualData,playerAction);
                for(let i=0;i<staticPlatforms.length;i++){
                    Bump.rectangleCollision(individualData,staticPlatforms[i]);
                }
            });
            //needsRefresh removed

            individualSocket.emit('worldInfo',{dynamicEntities});
        }
    }
}

function handleMoveCommands(player, commands) {
    var speed =25;
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
    if(commands.indexOf('75')!==-1&&player.cooldown<=0){
        let attack=new worldEntities.generatedProjectile(player,20,20,10000);
        dynamicEntities[attack.id]=attack;
        //worldEntities.refreshNotifier.value.push([attack.id]);
        player.cooldown=player.COOLDOWN_INTERVAL;
    }
}

const port=process.env.PORT||3000;

server.listen(port, ()=>{
    initializeWorld();
    console.log(`Server is up on port ${port}`);

    const update_interval = setInterval(update, UPDATE_INTERVAL_MS);
});
