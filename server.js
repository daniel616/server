const express=require('express');
const socketIO=require('socket.io');
const http=require('http');
const messages=require('./utils/message');
const worldEntities=require('./worldEntities');

var app=express();
var server = http.createServer(app);
var io=socketIO(server);

var playerSockets=[];//object indexed by id
var playerDataCollection={};//playerData indexed by corresponding socketId
var platforms=[];
var dynamicObjects=[];


app.use(express.static(__dirname+'/public'));

const update_rate=50;

io.on('connection',(socket)=>{
    socket.on('handShake',(callback)=>{
        console.log('New user connected: '+socket.id);
        playerSockets.push(socket);
        let playerData=new worldEntities.Player('wer');
        console.log('initialized a player with ID ' +playerData.clientID);
        playerDataCollection[socket.id]= playerData;

       callback(playerDataCollection);
    });

    socket.on('createMessage',(message)=>{
        io.sockets.emit('newMessage',
            messages.generateMessage(message.from,message.text));
    });

    socket.on('disconnect',()=>{
        //TODO: delete socket and playerData here
        delete playerSockets[socket.id];
        delete playerDataCollection[socket.id];
        //playerSockets.splice(playerSockets.indexOf(socket),1);
        io.sockets.emit('disconnect', socket.id);
    });

    io.sockets.emit('newMessage',
        messages.generateMessage('ADMIN','A NEW USER HAS JOINED US'));

    socket.on('getWorldInfo',(callback)=>{
        callback({
            players: playerDataCollection,
            dynamicObjects
        });
    })

    socket.on('Ping',(callback)=>{
        callback();
    });
})

function update(dt){
    playerSockets.forEach((playerSocket)=>fetchPlayerCommands(playerSocket));
}

function fetchPlayerCommands(playerSocket){
    playerSocket.emit('fetchCommands', function(playerAction){
        playerDataCollection[playerSocket.id].move(playerAction);
    });
}

const port=process.env.PORT||3000;


server.listen(port, ()=>{
    console.log(`Server is up on port ${port}`);
});



const update_interval = setInterval(update, 1000 / update_rate);