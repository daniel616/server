

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

let left = PIXI.keyboard(37);

function setup(){
    console.log(undefined===undefined);
    let id = resources["assets/baron/attackA.json"].textures;
    let frames=[];
    for(let i=1;i<38;i++){
        let string;
        if(i<10){
            string="baron_attackA000"+i+".png";
        }else{
            string="baron_attackA00"+i+".png";
        }
        frames.push(id[string]);
    }
    //let frames2=[id["baron"]]

    let pixie= su.sprite(frames,100,100);
    pixie.states={
        firstAttack:0,
        secondAttack:15,
        slash:[0,10]
    }


    pixie.playAnimation(pixie.states.slash);
    //pixie.show(pixie.states.firstAttack);
    //pixie.play();
    //pixie.animationSpeed=0.25;

    app.stage.addChild(pixie);
}