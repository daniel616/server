const worldEntities=require('./worldEntities');

const WIDTH=900;

function startingEntities(){
    var entities=[];
    entities.push(new worldEntities.Platform(200,500,WIDTH-400,30));
    entities.push(new worldEntities.Platform(300,300,WIDTH-600,30));
    entities.push(new worldEntities.Platform(0,100, 50, 700));
    entities.push(new worldEntities.Platform(WIDTH-50,100, 50, 700));

    //entities.push(new worldEntities.Platform(WIDTH/2,350,60,150));

    return entities;
}

module.exports={startingEntities};