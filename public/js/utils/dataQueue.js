//This bit has to sync with server interp duration
const INTERP_INTERVAL=100;

let dataQueue={
    queue:[],

    interpTime:0,

    enqueueData:function(data){
        this.queue.push(data);
    },

    timeStep:function(dt){
        this.interpTime+=dt;

        if(this.interpTime>=INTERP_INTERVAL){
            this.interpTime=0;
            this.queue.shift();

        }
    },

    cutForward:function(){
        while(this.queue.length>2){
            this.interpTime=0;
            this.queue.shift();
        }
    },

    get canInterp(){
        return this.queue.length>1;
    },

    get interpData(){
        return {interpA:this.queue[0],interpB:this.queue[1],interpRatio:this.interpTime/INTERP_INTERVAL};
    },

    get length(){
        return this.queue.length;
    }
}