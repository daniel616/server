'use strict';

let keyPresses=[];

let clientSprites={};

const RENDER_INTERVAL=10;

let userName='ANON';


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

let su = new SpriteUtilities(PIXI);


Loader.add(["assets/platform.png","assets/run.json","assets/baron/attackA.json"])
    .load(setup);

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


    playerSocket.emit('handShake',(worldData)=>{
        console.log('length: '+worldData.staticPlatforms.length);
        console.log('all platforms: '+ JSON.stringify(worldData.staticPlatforms));
        for(let i=0;i<worldData.staticPlatforms.length;i++){
            let platform=worldData.staticPlatforms[i];
            loadNewPlatform(platform);
        }

        playerSocket.on('worldInfo',(worldData)=>{
            dataQueue.enqueueData(worldData);
        });

        const update_interval = setInterval(()=>renderUpdate(RENDER_INTERVAL), RENDER_INTERVAL);
    });
}

function generateSprite(objectData){
    let newSprite;
    let renderFiles=mappings[objectData.renderKey];
    let renderStates=renderFiles.renderStates;
    if(renderStates){
        let JSONfile=renderFiles.JSONfile;
        let textures=resources["assets/"+JSONfile].textures;
        let images=renderFiles.loadSpecifications.map(id=>textures[id]);
        //console.log("sprite images:"+JSON.stringify(renderFiles.loadSpecifications))
        newSprite = su.sprite(images);
    }else{
        let spriteImage=renderFiles.spriteImage;
        newSprite=su.sprite(resources["assets/"+spriteImage].texture);
    }
    newSprite.x = objectData.x;
    newSprite.y = objectData.y;
    newSprite.width=objectData.width;
    newSprite.height=objectData.height;
    //TODO:REmove
    newSprite.animationSpeed=0;

    console.log(JSON.stringify(objectData));

    if(objectData.hasOwnProperty('anchor')){
         newSprite.anchor.set(objectData.anchor.x,objectData.anchor.y);
     }


    return newSprite;
}

function loadDynamicEntity(entityInfo){
    console.log('loaded Dynamic entity: ');
    let newSprite=generateSprite(entityInfo);
    clientSprites[entityInfo.id]=newSprite;
    app.stage.addChild(newSprite);
}

function loadNewPlatform(platformData){
    let newSprite=generateSprite(platformData);
    app.stage.addChild(newSprite);
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

    if(dataQueue.length>2){
        dataQueue.cutForward();
        console.log('Had to cut dataQueue off');
    }
    if (dataQueue.canInterp) {
        refreshSprites(data.interpA.dynamicEntities);
        if(dataQueue.interpTime===0){
            updateRendering(clientSprites,data.interpA.dynamicEntities);
        }
        interpData(data.interpA, data.interpB, data.interpRatio);
        dataQueue.timeStep(dt);
    }
}


//Assumes every dynamicEntitity has corresponding sprite and ice versa
function updateRendering(sprites, dynamicEntities){
    Object.keys(dynamicEntities).forEach(function(key,index){
        let sprite=sprites[key];
        let serverEntity=dynamicEntities[key];

        if(serverEntity.hasOwnProperty('direction')){
            if(serverEntity.direction==='left'){
                sprite.scale.x=Math.abs(sprite.scale.x);
            }
            if(serverEntity.direction==='right'){
                sprite.scale.x=-Math.abs(sprite.scale.x);
            }
        }

        console.log('renderStatus: '+serverEntity['renderStatus']);
        if(serverEntity.hasOwnProperty('renderStatus')&&serverEntity['renderStatus']!=="neutral"){
            let renderStates=mappings[serverEntity['renderKey']]['renderStates'];
            let renderDirections=renderStates[serverEntity['renderStatus']];

            console.log('renderDirections: '+JSON.stringify(renderDirections));

            if(renderDirections.hasOwnProperty('animationFrameNumbers')){
                sprite.loop=renderDirections.loop;
                if(renderDirections.hasOwnProperty('animationSpeed')){
                    console.log('found animation speed'+renderDirections.animationSpeed);
                    sprite.animationSpeed=renderDirections.animationSpeed;
                }
                sprite.playAnimation(renderDirections.animationFrameNumbers);
            }else {
                sprite.show(renderDirections);
            }

        }
    })
}

function interpData(interpA, interpB, interpRatio) {
    const dynamicEntities = interpA.dynamicEntities;
    const updatedEntities = interpB.dynamicEntities;

    Object.keys(dynamicEntities).forEach(function(key,index){
        if (updatedEntities.hasOwnProperty(key)) {
            let clientSprite = clientSprites[key];
            let oldEntity = dynamicEntities[key];
            let newEntity = updatedEntities[key];
            clientSprite.x = (newEntity.x - oldEntity.x) * interpRatio + oldEntity.x;
            clientSprite.y = (newEntity.y - oldEntity.y) * interpRatio + oldEntity.y;
        }
    });
}

function refreshSprites(dynamicEntities) {
    Object.keys(clientSprites).forEach(function (key, index) {
        if (!dynamicEntities.hasOwnProperty(key)) {
            clientSprites[key].visible=false;
            delete clientSprites.key;
        }
    });

    Object.keys(dynamicEntities).forEach(function(key,index){
        if (!clientSprites.hasOwnProperty(key)) {
            loadDynamicEntity(dynamicEntities[key]);
        }
    });
}