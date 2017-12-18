class Player extends PIXI.Sprite{
    constructor(x=0,y=0){
        super(PIXI.loader.resources["media/player.png"].texture);
        this.anchor.set(.5,.5); //position scaling etc are now from center of sprite
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
    }
}

class Circle extends PIXI.Graphics{
    constructor(radius, color=0x0000FF,x=0,y=0,speed=30,time=0){
        super();
        this.beginFill(color);
        this.drawCircle(0,0,radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        //variables
        this.xVel = 640 - this.x;
        this.yVel = 360 - this.y;
        this.speed = speed;
        this.isAlive = true;
        this.time = time;
    }

    move(dt=1/60){
        this.x += this.xVel * dt;
        this.y += this.yVel * dt;
    }

    reflectX(){
        this.xVel *= -1;
    }

    reflectY(){
        this.yVel *= -1;
    }
}