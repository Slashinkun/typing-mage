import { Goblin } from "./mobs/goblin.js";
import { Orc } from "./mobs/orc.js";
import { Flame } from "./flame.js";
import { words,bossWords } from "./words.js";
import { gameState } from "./gameState.js";
import {
    drawBackround,
    drawBarrier,
    drawLives,
    drawNextWaveMessage,
    drawGameOver,
    drawHurtAnimation,
    drawMobs,
    drawFlames,
    drawWinScreen
} from "./renderer.js";

//barrière  10px * longueur du canvas   
// hauteur du canvas - 10

//a faire : boss de fin et fin du jeu (ecran de fin)
// mot long pour le boss de fin

const spells = words
const BARRIER_HEIGHT = 10;
const MIN_MOB_DISTANCE = 50
const MOB_SPAWN_Y = -32
const DAMAGE_FLASH_DURATION = 10
const NEXT_WAVE_MSG_DURATION = 200;
const NEXT_WAVE_DELAY = 2000;
   
const canvas = document.querySelector("canvas");
canvas.width = 800;
canvas.height = 400;

const ctx = canvas.getContext("2d");
const playButton = document.getElementById("playButton");
const userInput = document.getElementById("userInput");

const DRAW_INTERVAL = 10

const FINAL_WAVE = 15

let isBossAppeared = false
let isBossDefeated = false

playButton.addEventListener("click",() => {
    if (!gameState.gameStarted) {
        gameState.gameStarted = true;
        playButton.style.display = "none";
        document.getElementById("player").style.display = "flex"
        gameState.currentWave = 1
        gameState.waitingNextWave = false   
        generateWave(gameState.mobsPerWave+gameState.currentWave)
        gameState.waveInProgress = true;
        document.getElementById("userInput").focus(); 
    }
});

function createMonster(type,x,y,word){
    if(type === "goblin") return new Goblin(x,y,word)
    if(type === "orc") return new Orc(x,y,word)

    
}


function generateBoss(){
    gameState.mobs = []
    let bossWord = bossWords[0]
    gameState.mobs.push(createMonster("orc",canvas.width/2,MOB_SPAWN_Y,bossWord))
    isBossAppeared = true
}

//cree une vague de "nb" monstres
function generateWave(nb){
    const gameWidth = canvas.width - 32; 
    let spawnedMobs = 0;

    const spawnInterval = setInterval(() => {
         if (spawnedMobs >= nb) {
            clearInterval(spawnInterval); 
            gameState.waitingNextWave = false;
            return;
        }

        let x,attempts = 0;
        do {
            x = Math.floor(Math.random() * gameWidth);
            attempts++;
            if (attempts > 50) break; 
        } while (isOverlapping(x, MOB_SPAWN_Y, gameState.mobs));
    
        const randomWord = spells[Math.floor(Math.random() * spells.length)];
        gameState.mobs.push(createMonster("goblin", x, MOB_SPAWN_Y, randomWord));
        spawnedMobs++;
    }, gameState.spawnDelay)
}

function startNextWave() {
  if (gameState.waitingNextWave || gameState.currentWave >= FINAL_WAVE) return;
    
    // Fin de vague, début attente
    gameState.waitingNextWave = true;
    gameState.waveInProgress = false;
    userInput.value = "";

    if (gameState.currentWave > 1) {
        userInput.disabled = true
        gameState.nextWaveMessage = `⚔ Vague ${gameState.currentWave} dans 2 secondes...`;
        gameState.nextWaveMessageTimer = NEXT_WAVE_MSG_DURATION;
    }

    setTimeout(() => {
        gameState.currentWave++;    
        
        gameState.spawnDelay = Math.max(200, gameState.spawnDelay - 100);
        const nbMobs = gameState.mobsPerWave + gameState.currentWave;
        generateWave(nbMobs);
        
        gameState.nextWaveMessage = "";
        gameState.waveInProgress = true;
        //gameState.waitingNextWave = false;


        userInput.disabled = false
        userInput.focus()


        setTimeout(() => {
        gameState.waitingNextWave = false;
        }, 1000);
    }, NEXT_WAVE_DELAY);
}



function isOverlapping(x, y, mobs) {
    return mobs.some(m => {
        const dx = m.posx - x;
        const dy = m.posy - y;
        return Math.sqrt(dx * dx + dy * dy) < MIN_MOB_DISTANCE;
    });
}

function updateMobs(){
    for(let mob of gameState.mobs){
        mob.update();
    }
}

//dessine sur le canvas les elements
function draw(){

    if(!gameState.gameStarted){
        return;
    }
    

    if(gameState.lives <= 0){
        console.log("Game over");
        
        userInput.disabled = true
        drawGameOver(ctx,canvas);
        return;
    }

    if (
    gameState.currentWave === FINAL_WAVE &&
    !isBossAppeared &&
    gameState.mobs.length === 0
    ) {
        generateBoss();
        return;
    }

    if (
    gameState.mobs.length === 0 &&
    gameState.waveInProgress &&
    !gameState.waitingNextWave &&
    gameState.currentWave < FINAL_WAVE
    ) {
        startNextWave();
    }

    lockOnMob();
    drawBackround(ctx,canvas);
    updateMobs();
    drawMobs(ctx,gameState.mobs,gameState.currentTarget);
    updateFlames();
    drawFlames(ctx,gameState.flames);
    drawBarrier(ctx,canvas);
    drawLives(ctx,canvas,gameState.lives);
    drawNextWaveMessage(ctx,canvas,gameState.nextWaveMessage,gameState.nextWaveMessageTimer);

    

    

    if (gameState.damageFlash) {
        drawHurtAnimation(ctx, canvas);
        gameState.damageFlash--;
    }
    
    
    const lostMobs = mobOutOfScreen();
    if (lostMobs > 0) {
        gameState.lives -= lostMobs;
        gameState.damageFlash = DAMAGE_FLASH_DURATION; 
    }

     if (isBossAppeared && gameState.mobs.length === 0 && !isBossDefeated) {
        isBossDefeated = true;
        userInput.disabled = true;
        gameState.nextWaveMessage = "🎉 Bravo ! Vous avez vaincu le boss final !";
        gameState.nextWaveMessageTimer = 500;
        drawWinScreen(ctx,canvas)
    
    }

    
}
   

function updateFlames() {
    for (let flame of gameState.flames) {
        flame.update();
    }
    gameState.flames = gameState.flames.filter(f => !f.finished);
}


//regarde le mot que l'utilisateur a tapé
function checkTyping(word){
    gameState.playerTyping = word;
    
    let targets = gameState.mobs.filter(mob => mob.wordtoType.startsWith(gameState.playerTyping)); //on cherche les monstres ou les mots correspond au mot du joueur
    if(targets.length >= 1 && gameState.playerTyping === targets[0].wordtoType) { //si il y a au moins 1 monstre
        for(let targetedMob of targets){
            gameState.flames.push(new Flame(targetedMob.posx, targetedMob.posy));
            gameState.mobs = gameState.mobs.filter(mob => !targets.includes(mob)); //on elimine les monstres qui possede le meme mot que le joueur
        } 
        gameState.playerTyping = "";
        document.getElementById("userInput").value = "";
        gameState.currentTarget = null;
    }

    
    
}
    
//quand l'utilisateur tape au clavier
document.getElementById("userInput").addEventListener("input",(event) => {
    checkTyping(event.target.value)
});



//trouver le monstre le plus proche de la limite du jeu (barrière)
function mobNearBarrier(){
    if(gameState.mobs.length === 0) return null;

    let nearestMob = gameState.mobs[0];
    let minDist = canvas.height - BARRIER_HEIGHT - nearestMob.posy;

    for (let mob of gameState.mobs) {
        let distToBarrier = canvas.height - BARRIER_HEIGHT - mob.posy;
        if (distToBarrier >= 0 && distToBarrier < minDist) {
            nearestMob = mob;
            minDist = distToBarrier;
        }
    }

    return nearestMob;
}


//changer la cible verrouillé
function lockOnMob(){
    gameState.currentTarget = mobNearBarrier();
}

//verifier si un monstre est sorti de l'ecran
function mobOutOfScreen(){
    let lostCount = 0;

    gameState.mobs = gameState.mobs.filter(mob => {
        if (mob.posy > canvas.height - BARRIER_HEIGHT) {
            lostCount++;
            return false;
        }
        return true;
    });

    return lostCount;
}



setInterval(draw,DRAW_INTERVAL);
