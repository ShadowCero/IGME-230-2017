class Player extends PIXI.Sprite{
    constructor(x=0,y=0){
        super(PIXI.loader.resources["media/player.png"].texture);
        this.anchor.set(.5,.5); //position scaling etc are now from center of sprite
        this.scale.set(0.3);
        this.x = x;
        this.y = y;
    }
}