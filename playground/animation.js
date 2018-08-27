

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


Loader.add(["assets/platform.png","assets/run.json","assets/projectile.json","assets/baron/attackA.json"])
    .load(setup);

function setup(){

}