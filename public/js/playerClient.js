'use strict';


let keyPresses=[];

let sprites={};

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

Loader.add(["assets/bomb.png","assets/platform.png","assets/run.json","assets/projectile.json"])
    .load(setup);


function loadSprite(objectData){
    let newSprite;
    let renderFiles=mappings[objectData.renderKey];
    let JSONfile=renderFiles.JSONfile;
    let spriteImage=renderFiles.spriteImage;
    if(JSONfile){
        let textures=resources["assets/"+JSONfile].textures;
        newSprite = new Sprite(textures[spriteImage]);
    }else{
        newSprite=new Sprite(resources["assets/"+spriteImage].texture);
    }
    newSprite.x = objectData.x;
    newSprite.y = objectData.y;
    newSprite.width=objectData.width;
    newSprite.height=objectData.height;
    return newSprite;
}

function loadDynamicEntity(entityInfo){
    let newSprite=loadSprite(entityInfo);
    sprites[entityInfo.id]=newSprite;
    app.stage.addChild(newSprite);
}

function loadNewPlatform(platformData){
    let newSprite=loadSprite(platformData);
    app.stage.addChild(newSprite);
}

function setup(){
    window.addEventListener('keydown',
        function(e){
            keyPresses[e.keyCode]=true;
        });

    window.addEventListener('keyup',
        function(e){
            keyPresses[e.keyCode]=false;
        });


    playerSocket.on('fetchCommands',(playerActionCallback)=>{
        playerActionCallback(fetchPlayerActions());
    });

    playerSocket.on('worldInfo',(worldData)=>{
        dataQueue.enqueueData(worldData);
    });

    playerSocket.emit('handShake',(worldData)=>{
        console.log('length: '+worldData.staticPlatforms.length);
        console.log('all platforms: '+ JSON.stringify(worldData.staticPlatforms));
        for(let i=0;i<worldData.staticPlatforms.length;i++){
            let platform=worldData.staticPlatforms[i];
            loadNewPlatform(platform);
        }

        const update_interval = setInterval(()=>renderUpdate(RENDER_INTERVAL), RENDER_INTERVAL);
    });
}

function fetchPlayerActions(){
    let pressedKeys=[];
    for(let key in keyPresses) {
        if(keyPresses[key]===true){
            pressedKeys.push(key.toString());
        }
    }

    return pressedKeys;
}

function renderUpdate(dt) {
    let data = dataQueue.interpData;
    if (dataQueue.canInterp) {
        refreshSprites(data.interpA.dynamicEntities);
        interpData(data.interpA, data.interpB, data.interpRatio);
        dataQueue.timeStep(dt);
    }
}

function interpData(interpA, interpB, interpRatio) {
    const dynamicEntities = interpA.dynamicEntities;
    const updatedEntities = interpB.dynamicEntities;

    Object.keys(dynamicEntities).forEach(function(key,index){
        if (updatedEntities.hasOwnProperty(key)&&sprites.hasOwnProperty(key)) {
            let clientSprite = sprites[key];
            let oldEntity = dynamicEntities[key];
            let newEntity = updatedEntities[key];
            clientSprite.x = (newEntity.x - oldEntity.x) * interpRatio + oldEntity.x;
            clientSprite.y = (newEntity.y - oldEntity.y) * interpRatio + oldEntity.y;
            console.log('x: ' + clientSprite.x + "y: " + clientSprite.y);
        }
    });
}

function refreshSprites(dynamicEntities) {
    Object.keys(sprites).forEach(function (key, index) {
        if (!dynamicEntities.hasOwnProperty(key)) {
            sprites[key].visible=false;
            delete sprites.key;
        }
    });

    Object.keys(dynamicEntities).forEach(function(key,index){
        if (!sprites.hasOwnProperty(key)) {
            loadDynamicEntity(dynamicEntities[key]);
        }
    });
}
