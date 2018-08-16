let keys=[];
let clientSprites={};

let staticPlatformSprites={};

let worldDataQueue=[];
let interpA;
let interpB;

const RENDER_INTERVAL=10;

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

Loader.add(["assets/bomb.png","assets/platform.png","assets/dude.png","assets/run.json","assets/projectile.json"])
    .load(setup);

function loadNewPlayer(playerInfo,socketID) {
    let baronID=resources["assets/run.json"].textures;
    let newSprite = new Sprite(baronID["baron_run0001.png"]);
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

    playerSocket.on('worldInfo',(worldData)=>{
        dataQueue.enqueueData(worldData);
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
            loadNewPlatform(platform);
        }

        const update_interval = setInterval(()=>update(RENDER_INTERVAL), RENDER_INTERVAL);
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
    console.log('tried to render')
    for (let socketID in updatedWorld.players){
        if (updatedWorld.players.hasOwnProperty(socketID)) {
            let clientSprite=clientSprites[socketID];
            clientSprite.x=updatedWorld.players[socketID].x;
            clientSprite.y=updatedWorld.players[socketID].y;
        }
    }
}

function update(dt){
    function interpData(interpA,interpB,interpRatio){
        const players=interpA.players;
        const updatedPlayers=interpB.players;
        for (let socketID in players){
            if (players.hasOwnProperty(socketID)&&updatedPlayers.hasOwnProperty(socketID)) {
                let clientSprite=clientSprites[socketID];
                let oldPlayer=players[socketID];
                let newPlayer=updatedPlayers[socketID];
                clientSprite.x=(newPlayer.x-oldPlayer.x)*interpRatio+oldPlayer.x;
                clientSprite.y=(newPlayer.y-oldPlayer.y)*interpRatio+oldPlayer.y;
            }
        }
    }
    if(dataQueue.canInterp){

        let data=dataQueue.interpData;
        interpData(data.interpA,data.interpB,data.interpRatio);
        dataQueue.timeStep(dt);

        console.log(data.interpRatio);
    }
}