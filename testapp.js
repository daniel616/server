const path = require('path');
const express=require('express');
const hbs=require('hbs');

var app=express();

app.set('view engine','hbs');
//app.use(express.static(__dirname+'/public'));

hbs.registerPartials(__dirname+'/views/partials');

app.get('/',(req,res)=>{
    res.render('index.hbs');
})

app.get('/portfolio',(req,res)=>{
    res.render('portfolio.hbs',{
        message:'I hop you lik my footer'
    })
})


const port=process.env.PORT||3000;


app.listen(port, ()=>{
    console.log(`Server is up on port ${port}`);
});

