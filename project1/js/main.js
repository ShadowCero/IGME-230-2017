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
let gameScene, player, timeLabel, slowLabel, deathSound, bgm;
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
    player = new Player(640,360);
}