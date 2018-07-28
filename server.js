const express=require('express');
const socketIO=require('socket.io');
const http=require('http');
const messages=require('./utils/message');
const worldEntities=require('./worldEntities');

var app=express();
var server = http.createServer(app);
var io=socketIO(server);

var playerSockets=[];
var players={};
var dynamicObjects=[];

app.use(express.static(__dirname+'/public'));

const update_rate=50;

io.on('connection',(socket)=>{
    console.log('New user connected');
    console.log(typeof socket.id);
    playerSockets.push(socket);
    console.log(socket.id);
    players[socket.id]=new worldEntities.Player('wer');
    console.log(JSON.stringify(players));
    console.log(JSON.stringify(players[socket.id],undefined,2));

    socket.on('createMessage',(message)=>{
        socket.broadcast.emit('newMessage',
            messages.generateMessage(message.from,message.text));
    });

    socket.on('disconnect',()=>{
        console.log('User disconnected');
        playerSockets.splice(playerSockets.indexOf(socket),1);
        delete players[socket.id];
    });



    socket.emit('newMessage',
        messages.generateMessage('ADMIN','WELCOME'));

    socket.broadcast.emit('newMessage',
        messages.generateMessage('ADMIN','A NEW USER HAS JOINED US'));

    socket.on('getWorldInfo',(callback)=>{
        callback({
            players,
            dynamicObjects
        });
    })

    socket.on('Ping',(callback)=>{
        callback();
        console.log('got pinged');
    });
})

function update(dt){
    playerSockets.forEach((playerSocket)=>fetchPlayerCommands(playerSocket));
}

function fetchPlayerCommands(playerSocket){
    playerSocket.emit('fetchCommands', function(playerAction){
        //Later executes these actions in internal server
        //console.log(playerAction.toString());
        //console.log(playerAction.length);
        players[playerSocket.id].move(playerAction);
    });
}

const port=process.env.PORT||3000;


server.listen(port, ()=>{
    console.log(`Server is up on port ${port}`);
});



const update_interval = setInterval(update, 1000 / update_rate);