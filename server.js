const express=require('express');
const socketIO=require('socket.io');
const http=require('http');
const Bump=require('./bastBump');
const messages=require('./utils/message');
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



app.use(express.static(__dirname+'/public'));

const update_rate=50;

io.on('connection',(socket)=>{
    socket.on('handShake',(callback)=>{
        console.log('New user connected: '+socket.id);
        playerSockets[socket.id]=socket;
        let playerData=new worldEntities.Player('wer');
        playerDataCollection[socket.id]= playerData;
        socket.broadcast.emit('newPlayer',{player:playerData,socketID:socket.id});
        callback({playerDataCollection,staticPlatforms});
    });

    socket.on('createMessage',(message)=>{
        io.sockets.emit('newMessage',
            messages.generateMessage(message.from,message.text));
    });

    socket.on('disconnect',()=>{
        delete playerSockets[socket.id];
        delete playerDataCollection[socket.id];
        socket.broadcast.emit('otherDisconnect', socket.id);
    });

    io.sockets.emit('newMessage',
        messages.generateMessage('ADMIN','A NEW USER HAS JOINED US'));

    socket.on('getWorldInfo',(callback)=>{
        callback({
            players: playerDataCollection,
            dynamicObjects
        });
    });

    socket.on('Ping',(callback)=>{
        callback();
    });
});

function initializeWorld(){
    staticPlatforms.push(new worldEntities.Platform(0,100,60,500));
    staticPlatforms.push(new worldEntities.Platform(WIDTH-60,100,60,800));

    staticPlatforms.push(new worldEntities.Platform(200,400,500,30));
}

function update(dt){
    for(let socketID in playerSockets){
        if(playerSockets.hasOwnProperty(socketID)&&playerDataCollection.hasOwnProperty(socketID)){
            respondPlayerCommands(playerSockets[socketID]);
        }
    }
}

function respondPlayerCommands(playerSocket){
    playerSocket.emit('fetchCommands', function(playerAction){
        worldEntities.handleMoveCommands(playerDataCollection[playerSocket.id],playerAction);
        for(let i=0;i<staticPlatforms.length;i++){
            Bump.rectangleCollision(playerDataCollection[playerSocket.id],staticPlatforms[i]);
        }
    });
}

const port=process.env.PORT||3000;

server.listen(port, ()=>{
    initializeWorld();
    console.log(`Server is up on port ${port}`);
});

const update_interval = setInterval(update, 1000 / update_rate);