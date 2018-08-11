let playerSocket=io();
let keys=[];
let clientSprites=[];

let update_rate=10;

let userName='DIO';


let type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}

PIXI.utils.sayHello(type);

//Create a Pixi Application
let app = new PIXI.Application({width: 256, height: 256});
app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.backgroundColor = 0xf0f0f0;

//Add the canvas that Pixi automatically created for you to the HTML document
$('#game').append(app.view);

const Loader=PIXI.loader;
const Sprite=PIXI.Sprite;
const resources=Loader.resources;

Loader.add(["assets/bomb.png","assets/platform.png","assets/dude.png"])
    .load(setup);

function setup(){
    function loadNewPlayer(playerInfo) {
        let newSprite = new PIXI.Sprite(PIXI.loader.resources["assets/bomb.png"].texture);
        clientSprites[playerInfo.socketID] = newSprite;
        newSprite.x = playerInfo.x;
        newSprite.y = playerInfo.y;
        app.stage.addChild(newSprite);
    }

    window.addEventListener('keydown',
        function(e){
            keys[e.keyCode]=true;
        });

    window.addEventListener('keyup',
        function(e){
            keys[e.keyCode]=false;
        });

    playerSocket.on('newPlayer',(playerInfo)=>loadNewPlayer(playerInfo));

    playerSocket.on('fetchCommands',(playerActionCallback)=>{
        playerActionCallback(fetchPlayerActions());
    });

    playerSocket.on('disconnect',(socketID)=>{
        clientSprites[socketID].visible=false;
    });

    playerSocket.emit('handShake',(playerDataCollection)=>{
        for(var socketID in playerDataCollection){
            if(playerDataCollection.hasOwnProperty(socketID)){
                loadNewPlayer(playerDataCollection[socketID]);
            }
        }

        const update_interval = setInterval(update, 1000/update_rate);

    });
}

function fetchPlayerActions(){
    let pressedKeys=[];
    for(variable in keys) {
        if(keys[variable]===true){
            pressedKeys.push(variable.toString());
        }
    }

    return pressedKeys;
}

function render(updatedWorld){
    for (var player in updatedWorld.players){
        if (updatedWorld.players.hasOwnProperty(player)) {
            console.log('player: '+JSON.stringify(updatedWorld.players[player]));
            let clientSprite=clientSprites[updatedWorld.players[player].socketID];
            clientSprite.x=updatedWorld.players[player].x;
            clientSprite.y=updatedWorld.players[player].y;


            console.log('found property');
        }
    }
}

function update(){
    playerSocket.emit('getWorldInfo',render);
}




function setUpPlayerMovement(){

    let left=keyboard(65);
    left.press=function(event){
        player.vx=-1;
    };
    left.release=function(event){
        player.vx=0;
    };

    let right=keyboard(68);
    right.press=function(event){
        player.vx=1;
    };
    right.release=function(event){
        player.vx=0;
    };

    let up=keyboard(87);
    up.press=function(event){
        player.vy=-1;
    };
    up.release=function(event){
        player.vy=0;
    };

    let down=keyboard(83);
    down.press=function(event){
        player.vy=1;
    };
    down.release=function(event){
        player.vy=0;
    };

    function keyboard(keyCode) {
        let key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        //The `downHandler`
        key.downHandler = event => {
            //alert(event.keyCode);
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };

        //The `upHandler`
        key.upHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        };

        //Attach event listeners
        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );
        return key;
    }

}

