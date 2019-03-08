const mappings = {
    player: {
        renderStates:{
            neutral:5,
            slash:{
                animationFrameNumbers:[5,10],
                loop:false,
                animationSpeed:0.6
            },
            shoot:{
                animationFrameNumbers:[1,4],
                loop:false,
                animationSpeed:0
            },
            sprint:{

            },
            run:{

            },
            takeDamage:{

            },
            die:{

            }
        },
        JSONfile: "baron/attackA.json",
        loadSpecifications:["baron_attackA0004.png",
            "baron_attackA0005.png","baron_attackA0008.png","baron_attackA0009.png","baron_attackA0010.png","baron_attackA0011.png","baron_attackA0012.png","baron_attackA0013.png","baron_attackA0014.png","baron_attackA0015.png","baron_attackA0016.png","baron_attackA0017.png","baron_attackA0018.png","baron_attackA0019.png","baron_attackA0020.png","baron_attackA0021.png","baron_attackA0022.png","baron_attackA0023.png","baron_attackA0024.png","baron_attackA0025.png","baron_attackA0026.png","baron_attackA0027.png","baron_attackA0028.png","baron_attackA0029.png","baron_attackA0030.png","baron_attackA0031.png","baron_attackA0032.png","baron_attackA0033.png","baron_attackA0034.png","baron_attackA0035.png","baron_attackA0036.png","baron_attackA0037.png"]

    },


    platform: {
        spriteImage: "platform.png"
    },

    projectile: {
        spriteImage: "star.png"
    }
};
