const express=require('express');
const socketIO=require('socket.io');
const http=require('http');
const Bump=require('./bastBump');
//const messages=require('./utils/message');
const worldEntities=require('./worldEntities');


var app=express();
var server = http.createServer(app);
var io=socketIO(server);

var playerSockets={};//object indexed by id
var playerDataCollection={};//playerData indexed by corresponding socketId
var staticPlatforms=[];
var dynamicObjects=[];

const HEIGHT=600;
const WIDTH=900;
const HEALTH_MAX=10;
let spawnLeft=true;

app.use(express.static(__dirname+'/public'));

const UPDATE_INTERVAL_MS=100;

io.on('connection',(socket)=>{
    socket.on('handShake',(callback)=>{
        console.log('New user connected: '+socket.id);
        playerSockets[socket.id]=socket;
        let playerData=new worldEntities.Player('wer');
        respawnPlayer(playerData);
        playerDataCollection[socket.id]= playerData;
        socket.broadcast.emit('newPlayer',{player:playerData,socketID:socket.id});
        callback({playerDataCollection,staticPlatforms});
    });

    socket.on('createMessage',(message)=>{
        io.sockets.emit('newMessage',
            new generateMessage(message.from,message.text));
    });

    socket.on('disconnect',()=>{
        delete playerSockets[socket.id];
        delete playerDataCollection[socket.id];
        socket.broadcast.emit('otherDisconnect', socket.id);
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

    let xPos=spawnLeft? 0:WIDTH-playerData.width;
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
    //console.log('updated');
    for(let socketID in playerSockets){
        if(playerSockets.hasOwnProperty(socketID)&&playerDataCollection.hasOwnProperty(socketID)){
            const individualSocket=playerSockets[socketID];

            individualSocket.emit('fetchCommands', function(playerAction){
                handleMoveCommands(playerDataCollection[socketID],playerAction);
                for(let i=0;i<staticPlatforms.length;i++){
                    Bump.rectangleCollision(playerDataCollection[socketID],staticPlatforms[i]);
                }
            });

            individualSocket.emit('worldInfo',{players:playerDataCollection,dynamicObjects});
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
    if(commands.indexOf('')!==-1){
    }
}

const port=process.env.PORT||3000;

server.listen(port, ()=>{
    initializeWorld();
    console.log(`Server is up on port ${port}`);

    const update_interval = setInterval(update, UPDATE_INTERVAL_MS);
});
