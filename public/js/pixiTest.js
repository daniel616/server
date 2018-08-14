let keys=[];
let clientSprites={};
let staticPlatformSprites={};

let update_rate=10;

let userName='DIO';


let type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}

PIXI.utils.sayHello(type);

//Create a Pixi Application
let app = new PIXI.Application({width: 900, height: 600});
app.renderer.backgroundColor = 0xf0f0f0;

//Add the canvas that Pixi automatically created for you to the HTML document
$('#game').append(app.view);

const Loader=PIXI.loader;
const Sprite=PIXI.Sprite;
const resources=Loader.resources;

Loader.add(["assets/bomb.png","assets/platform.png","assets/dude.png"])
    .load(setup);

function loadNewPlayer(playerInfo,socketID) {
    let newSprite = new Sprite(resources["assets/bomb.png"].texture);
    clientSprites[socketID] = newSprite;
    newSprite.x = playerInfo.x;
    newSprite.y = playerInfo.y;
    newSprite.width=playerInfo.width;
    newSprite.height=playerInfo.height;
    app.stage.addChild(newSprite);
}


function loadNewPlatform(platformData){
    console.log('Loading platform');
    let newSprite=new Sprite(resources["assets/platform.png"].texture);
    console.log(JSON.stringify(platformData));
    newSprite.x=platformData.x;
    newSprite.y=platformData.y;
    newSprite.width=platformData.width;
    newSprite.height=platformData.height;
    console.log('x,y'+platformData.x+platformData.y);
    app.stage.addChild(newSprite);

}

function setup(){
    window.addEventListener('keydown',
        function(e){
            keys[e.keyCode]=true;
        });

    window.addEventListener('keyup',
        function(e){
            keys[e.keyCode]=false;
        });

    playerSocket.on('newPlayer',(playerInfo)=>loadNewPlayer(playerInfo.player,playerInfo.socketID));

    playerSocket.on('fetchCommands',(playerActionCallback)=>{
        playerActionCallback(fetchPlayerActions());
    });

    playerSocket.on('otherDisconnect',(socketID)=>{
        console.log('disconnected socketID: '+socketID);
        clientSprites[socketID].visible=false;
    });

    playerSocket.emit('handShake',(worldData)=>{
        let playerDataCollection=worldData.playerDataCollection;
        for(var socketID in playerDataCollection){
            if(playerDataCollection.hasOwnProperty(socketID)){
                loadNewPlayer(playerDataCollection[socketID],socketID);
            }
        }

        console.log('length: '+worldData.staticPlatforms.length);
        console.log('all platforms: '+ JSON.stringify(worldData.staticPlatforms));
        for(var i=0;i<worldData.staticPlatforms.length;i++){
            let platform=worldData.staticPlatforms[i];
            //console.log(JSON.stringify(platform));
            loadNewPlatform(platform);
        }

        const update_interval = setInterval(update, 1000/update_rate);
    });
}

function fetchPlayerActions(){
    let pressedKeys=[];
    for(var key in keys) {
        if(keys[key]===true){
            pressedKeys.push(key.toString());
        }
    }

    return pressedKeys;
}

function render(updatedWorld){
    for (var socketID in updatedWorld.players){
        if (updatedWorld.players.hasOwnProperty(socketID)) {
            let clientSprite=clientSprites[socketID];
            clientSprite.x=updatedWorld.players[socketID].x;
            clientSprite.y=updatedWorld.players[socketID].y;
        }
    }
}

function update(){
    playerSocket.emit('getWorldInfo',render);

}