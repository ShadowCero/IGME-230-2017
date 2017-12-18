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

let stage;

// game variables
let startScene;
let helpScene;
let gameScene, player, startTime, timeLabel, slowLabel, deathSound, bgm;
let gameOverScene;

let enemies = [];
let powerUps = [];
let time = 0;
let paused = true;

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
        down = keyboard(40);

    //Left arrow `press`
    left.press = () => {
        //Change the velocity when the key is pressed
        player.vx = -5;
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
        player.vy = -5;
        player.vx = 0;
    };
    up.release = () => {
        if (!down.isDown && player.vx === 0) {
            player.vy = 0;
        }
    };
    //Right
    right.press = () => {
        player.vx = 5;
        player.vy = 0;
    };
    right.release = () => {
        if (!left.isDown && player.vy === 0) {
            player.vx = 0;
        }
    };
    //Down
    down.press = () => {
        player.vy = 5;
        player.vx = 0;
    };
    down.release = () => {
        if (!up.isDown && player.vx === 0) {
            player.vy = 0;
        }
    };

    //load sounds

    //start update loop
    app.ticker.add(gameLoop);
}

function createLabelsAndButtons() {
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
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
    startLabel1.y = 150;
    startScene.addChild(startLabel1);
}