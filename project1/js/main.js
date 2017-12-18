"use strict";
const app = new PIXI.Application(1280, 720);
document.querySelector("#game").appendChild(app.view);

//constants 
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// pre-load
PIXI.loader.
    add(["media/player.png", "media/background.png"]).
    on("progress", e => { console.log(`progress=${e.progress}`) }).
    load(setup);

//Aliases
let stage;

// game variables
let startScene;
let helpScene;
let gameScene, player, slowTime, startTime, timeLabel, slowLabel, deathSound, bgm, activated, spawnTime;
let gameOverScene, highScore, playerScoreLabel, highScoreLabel;

let circles = [];
let powerUps = [];
let time = 0;
let paused = true;

//Sets up the base of the scenes for each game state
function setup() {
    stage = app.stage;
    //Create the start scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    //create other scenes and make them invisible
    helpScene = new PIXI.Container();
    helpScene.visible = false;
    stage.addChild(helpScene);

    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    //set up labels
    createLabelsAndButtons();

    //create the player
    player = new Player(640, 360);
    gameScene.addChild(player);

    //Add keyboard movement for player
    //Capture the keyboard arrow keys
    let left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40),
        shift = keyboard(16);

    //Left arrow `press`
    left.press = () => {
        //Change the velocity when the key is pressed
        player.vx = -8;
        player.vy = 0;
    };
    //Left arrow key `release`
    left.release = () => {
        //stop player if other arrow isn't down and isnt moving up
        if (!right.isDown && player.vy === 0) {
            player.vx = 0;
        }
    };
    //Up
    up.press = () => {
        player.vy = -8;
        player.vx = 0;
    };
    up.release = () => {
        if (!down.isDown && player.vx === 0) {
            player.vy = 0;
        }
    };
    //Right
    right.press = () => {
        player.vx = 8;
        player.vy = 0;
    };
    right.release = () => {
        if (!left.isDown && player.vy === 0) {
            player.vx = 0;
        }
    };
    //Down
    down.press = () => {
        player.vy = 8;
        player.vx = 0;
    };
    down.release = () => {
        if (!up.isDown && player.vx === 0) {
            player.vy = 0;
        }
    };
    //Shift
    shift.press = () => {
        //If shift key hasn't been pressed before, slow all circles
        //and set the shift key to have been pressed
        if(activated == false){
            slowDown(circles);
            activated = true;
        }
    }
    shift.release = () => {
        //If shift key has been pressed on release then return all
        //circles to normal speed and set the activator to false
        if (activated == true){
            normalSpeed(circles);
            activated = false;
        }
    }

    //load sounds
    deathSound = new Howl({
        src: ['media/death.wav']
    });
    bgm = new Howl({
        src: ['media/bgm.mp3']
    });
    //play bgm on loop
    bgm.loop(true);
    bgm.play();

    //start update loop
    app.ticker.add(gameLoop);
}

//Creates the labels for each scene and the buttons to switch between scenes
//Along with adding the background to each scene
function createLabelsAndButtons() {
    //add background
    let bg = PIXI.Sprite.fromImage("media/background.png");
    bg.position.x = 0;
    bg.position.y = 0;
    bg.width = 1280;
    bg.height = 720;
    let bg2 = PIXI.Sprite.fromImage("media/background.png");
    bg2.position.x = 0;
    bg2.position.y = 0;
    bg2.width = 1280;
    bg2.height = 720;
    let bg3 = PIXI.Sprite.fromImage("media/background.png");
    bg3.position.x = 0;
    bg3.position.y = 0;
    bg3.width = 1280;
    bg3.height = 720;
    let bg4 = PIXI.Sprite.fromImage("media/background.png");
    bg4.position.x = 0;
    bg4.position.y = 0;
    bg4.width = 1280;
    bg4.height = 720;
    startScene.addChild(bg);
    gameScene.addChild(bg2);
    helpScene.addChild(bg3);
    gameOverScene.addChild(bg4);

    let buttonStyle = new PIXI.TextStyle({
        fill: 0x01af16,
        fontSize: 48,
        fontFamily: "geoFont"
    });

    //startScene labels
    let startLabel1 = new PIXI.Text("Geometry Rush");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xF48342,
        fontSize: 96,
        fontFamily: "geoFont",
        stroke: 0x4b464c,
        strokeThickness: 3
    })
    startLabel1.x = 300;
    startLabel1.y = 100;
    startScene.addChild(startLabel1);

    //create startGame and getHelp buttons
    let startButton = new PIXI.Text("Start Game");
    startButton.style = buttonStyle;
    startButton.x = 500;
    startButton.y = sceneHeight - 230;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on("pointerover", e => e.target.alpha = 0.7);
    startButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);

    let helpButton = new PIXI.Text("Controls");
    helpButton.style = buttonStyle;
    helpButton.x = 500;
    helpButton.y = sceneHeight - 150;
    helpButton.interactive = true;
    helpButton.buttonMode = true;
    helpButton.on("pointerup", helpGame);
    helpButton.on("pointerover", e => e.target.alpha = 0.7);
    helpButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    startScene.addChild(helpButton);

    //Set up helpScene
    let helpLabel1 = new PIXI.Text("Move with Arrow Keys");
    helpLabel1.style = new PIXI.TextStyle({
        fill: 0xF48342,
        fontSize: 55,
        fontFamily: "geoFont",
        stroke: 0x4b464c,
        strokeThickness: 3
    })
    helpLabel1.x = 200;
    helpLabel1.y = 100;
    helpScene.addChild(helpLabel1);

    let helpLabel2 = new PIXI.Text("Left Shift to slow circles with time.");
    helpLabel2.style = new PIXI.TextStyle({
        fill: 0xF48342,
        fontSize: 55,
        fontFamily: "geoFont",
        stroke: 0x4b464c,
        strokeThickness: 3
    })
    helpLabel2.x = 100;
    helpLabel2.y = helpLabel1.y + 150;
    helpScene.addChild(helpLabel2);

    let menuButton = new PIXI.Text("Return");
    menuButton.style = buttonStyle;
    menuButton.x = 500;
    menuButton.y = sceneHeight - 100;
    menuButton.interactive = true;
    menuButton.buttonMode = true;
    menuButton.on("pointerup", menuGame);
    menuButton.on("pointerover", e => e.target.alpha = 0.7);
    menuButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    helpScene.addChild(menuButton);

    //set up gameScene
    let gameTextStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 30,
        fontFamily: "geoFont",
        stroke: 0xFF0000,
        strokeThickness: 4
    });
    //timeLabel
    timeLabel = new PIXI.Text();
    timeLabel.style = gameTextStyle;
    timeLabel.y = 5;
    timeLabel.x = 5;
    gameScene.addChild(timeLabel);
    updateTime(0);
    //slowLabel
    slowLabel = new PIXI.Text();
    slowLabel.style = gameTextStyle;
    slowLabel.style = {fill: 0x01af16, fontFamily: "geoFont"};
    slowLabel.y = 40;
    slowLabel.x = 5;
    gameScene.addChild(slowLabel);
    updateSlow(0);

    //set up gameOverScene
    let gameOverText = new PIXI.Text("You died!");
    let goTextStyle = new PIXI.TextStyle({
        fill: 0xF48342,
        fontSize: 55,
        fontFamily: "geoFont",
        stroke: 0x4b464c,
        strokeThickness: 3
    })
    gameOverText.style = goTextStyle;
    gameOverText.x = 500;
    gameOverText.y = 100;
    gameOverScene.addChild(gameOverText);

    playerScoreLabel = new PIXI.Text();
    playerScoreLabel.style = goTextStyle;
    playerScoreLabel.x = 400;
    playerScoreLabel.y = 210;
    gameOverScene.addChild(playerScoreLabel);

    highScoreLabel = new PIXI.Text();
    highScoreLabel.style = goTextStyle;
    highScoreLabel.x = 400;
    highScoreLabel.y = 320;
    gameOverScene.addChild(highScoreLabel);

    let playAgainButton = new PIXI.Text("Restart");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 580;
    playAgainButton.y = sceneHeight - 200;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame);
    playAgainButton.on('pointerover', e => e.target.alpha = 0.7);
    playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(playAgainButton);

    let returnButton = new PIXI.Text("Menu");
    returnButton.style = buttonStyle;
    returnButton.x = 580;
    returnButton.y = sceneHeight - 100;
    returnButton.interactive = true;
    returnButton.buttonMode = true;
    returnButton.on("pointerup", menuGame);
    returnButton.on('pointerover', e => e.target.alpha = 0.7);
    returnButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(returnButton);
}

//Scene switchers
//Sets up all the variables to be appropriate for the start of the game
function startGame(){
    startScene.visible = false;
    helpScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;

    //Reset starting variables
    //startTime = new Date;
    time = 0;
    slowTime = 10000; //in milliseconds
    player.x = 640;
    player.y = 360;
    activated = false;
    spawnTime = 0;
    createCircles(5);
    updateTime(time);
    updateSlow(slowTime);

    paused = false;
}
//Sets the scene to the help menu
function helpGame(){
    startScene.visible = false;
    helpScene.visible = true;
    gameOverScene.visible = false;
    gameScene.visible = false;
}
//Sets the scene to the main menu
function menuGame(){
    startScene.visible = true;
    helpScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = false;
}
//Sets the scene to the game over screen
//Shows player score and high score
function gameOver(){
    paused = true;

    //clear level
    circles.forEach(c => gameScene.removeChild(c));
    circles = [];
    powerUps.forEach(p => gameScene.removeChild(p));
    powerUps = [];

    startScene.visible = false;
    helpScene.visible = false;
    gameOverScene.visible = true;
    gameScene.visible = false;

    //display highscore and player score
    playerScoreLabel.text = `Your score: ${timeLabel.text}`;

    //get highscore from localStorage
    highScore = localStorage.getItem("yxb1236HS");
    if(highScore){
        highScore = parseInt(highScore);
        updateTime(highScore);
        highScoreLabel.text = `High Score: ${timeLabel.text}`;
    }
    else{
        highScore = 0;
    }
    if(highScore < time){
        localStorage.setItem("yxb1236HS", time);
    }
}

//game functions
//Formats a time in milliseconds to the seconds and minutes and displays them
function updateTime(distance){
    //calculate minutes and seconds from the milliseconds
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    //edit label text
    timeLabel.text = `${minutes}:${seconds}`;
}
//Formats a time in milliseconds to the seconds and minutes and displays them for the slow timer
function updateSlow(distance){
    //calculate minutes and seconds from the milliseconds
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    //edit label text
    slowLabel.text = `Slow: ${minutes}:${seconds}`;
}
//Halves the speed of all circles in the scene
function slowDown(group){
    for(let g of group){
        g.xVel /= 2;
        g.yVel /= 2;
    }

}
//Returns the speed of the circles (doubles them back to original value)
function normalSpeed(group){
    for(let g of group){
        g.xVel *= 2;
        g.yVal *= 2;
    }
}

//Game loop
function gameLoop(){
    if (paused) return;

    //calculate delta time
    let dt = 1 / app.ticker.FPS;
    if (dt > 1/30) dt = 1/30;

    //calculate time
    time += app.ticker.elapsedMS;
    updateTime(time);

    updateSlow(slowTime);

    spawnTime += app.ticker.elapsedMS;

    //move player
    let newX = player.x + player.vx;
    let newY = player.y + player.vy;

    // keep player on screen
    let w2 = player.width / 2;
    let h2 = player.height / 2;
    player.x = clamp(newX, 0 + w2, sceneWidth - w2);
    player.y = clamp(newY, 0 + h2, sceneHeight - h2);

    //move circles
    for (let c of circles) {
        let aliveTime = time - c.time;
        c.move(dt)
        if ((c.x <= c.radius || c.x >= sceneWidth - c.radius) && aliveTime > 2000) {
            c.reflectX();
            c.move(dt);
        }

        if ((c.y <= c.radius || c.y >= sceneHeight - c.radius) && aliveTime > 2000) {
            c.reflectY();
            c.move(dt);
        }

        //If circle alive for too long kill it
        if (aliveTime > 10000){
            c.isAlive = false;
            gameScene.removeChild(c);
        }
    }

    //circle collisions
    for(let c of circles){
        if (c.isAlive && rectsIntersect(c, player)){
            deathSound.play();
            gameScene.removeChild(c);
            c.isAlive = false;
            gameOver();
        }
    }
    //powerUp collisions

    //clean up
    circles = circles.filter(c => c.isAlive);

    //spawn more circles
    if (spawnTime > 1500){
        spawnTime = 0;
        createCircles(2);
    }

}

//Creates circles on a random edge of the screen and shoots it inwards
function createCircles(number){
    //Generate number of circles told
    for (let i = 0; i < number; i++){
        let x = 0;
        let y = 0;
    
        switch(Math.floor(getRandom(0,4))){
            //left side of screen
            case 0:
                x = -10;
                y = Math.floor(getRandom(5,710));
                break;
            //right side of screen
            case 1:
                x = 1290;
                y = Math.floor(getRandom(5,710));
                break;
            //top of screen
            case 2:
                y = -10;
                x = Math.floor(getRandom(5,1270));
                break;
            //bottom of screen
            case 3:
                y = 730;
                x = Math.floor(getRandom(5,1270));
                break;
        }

        let circle = new Circle(Math.floor(getRandom(20,60)),0x0000FF,x,y,Math.floor(getRandom(20,80)),time);
        circles.push(circle);
        gameScene.addChild(circle);
    }
}