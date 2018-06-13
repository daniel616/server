const path = require('path');
const express=require('express');
const hbs=require('hbs');
const socketIO=require('socket.io');
const http=require('http');

var app=express();
var server = http.createServer(app);
var io=socketIO(server);

app.set('view engine','hbs');

app.use(express.static(__dirname+'/public'));

hbs.registerPartials(__dirname+'/views/partials');


app.get('/portfolio',(req,res)=>{
    res.render('portfolio.hbs',{
        message:'I hop you lik my footer'
    })
})

io.on('connection',(socket)=>{
    console.log('New user connected');

    socket.on('createMessage',(message)=>{
        console.log(message);
    });

    socket.on('disconnect',()=>{
        console.log('User disconnected');
    });

    socket.emit('newMessage',{
        from:'ADMIN',
        text:'WELCOME USER',
        time: new Date().getTime()
    })

    socket.broadcast.emit('newMessage',{
        from:'ADMIN',
        text:'A USER HAS JOINED US',
        time: new Date().getTime()
    })
})


const port=process.env.PORT||3000;


server.listen(port, ()=>{
    console.log(`Server is up on port ${port}`);
});

