import { Goblin } from "./mobs/goblin.js";
import { Flame } from "./flame.js";
import { words } from "./words.js";
import { gameState } from "./gameState.js";
import {
    drawBackround,
    drawBarrier,
    drawLives,
    drawNextWaveMessage,
    drawGameOver,
    drawHurtAnimation,
    drawMobs,
    drawFlames
} from "./renderer.js";

//barrière  10px * longueur du canvas   
// hauteur du canvas - 10


const spells = words
   
const canvas = document.querySelector("canvas");
canvas.width = 800;
canvas.height = 400;

const ctx = canvas.getContext("2d");
const playButton = document.getElementById("playButton");
const userInput = document.getElementById("userInput");

playButton.addEventListener("click",() => {
    if (!gameState.gameStarted) {
        gameState.gameStarted = true;
        playButton.style.display = "none";
        document.getElementById("player").style.display = "flex"
        document.getElementById("userInput").focus(); 
        gameState.currentWave = 1
        generateWave(gameState.mobsPerWave+gameState.currentWave)
    }
});

function createMonster(type,x,y,word){
    if(type === "goblin") return new Goblin(x,y,word)
}



//cree une vague de "nb" monstres
function generateWave(nb){
    gameState.waveInProgress = true; 
    const gameWidth = canvas.width - 32; 
    const spawnY = -32; 
     
    let spawnedMobs = 0;

    const spawnInterval = setInterval(() => {
         if (spawnedMobs >= nb) {
            clearInterval(spawnInterval); 
            return;
        }

        let x,attempts = 0
        do {
            x = Math.floor(Math.random() * gameWidth);
            attempts++;
            if (attempts > 50) break; 
        } while (isOverlapping(x, spawnY, gameState.mobs));
    
    

    const randomWord = spells[Math.floor(Math.random() * spells.length)];
    gameState.mobs.push(createMonster("goblin",x, spawnY, randomWord));
    spawnedMobs++;
    }, gameState.spawnDelay)
}

function isOverlapping(x, y, mobs, minDistance = 50) {
    return mobs.some(m => {
        const dx = m.posx - x;
        const dy = m.posy - y;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
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
    

    if(gameState.lives < 0){
        userInput.disabled = true
        drawGameOver(ctx,canvas);
        return;
    }else{
        lockOnMob();
        drawBackround(ctx,canvas);
        updateMobs();
        drawMobs(ctx,gameState.mobs,gameState.currentTarget);
        updateFlames();
        drawFlames(ctx,gameState.flames);
        drawBarrier(ctx,canvas);
        drawLives(ctx,canvas,gameState.lives);
        drawNextWaveMessage(ctx,canvas,gameState.nextWaveMessage,gameState.nextWaveMessageTimer);

        

    }

    if (gameState.damageFlash) {
        drawHurtAnimation(ctx, canvas);
        gameState.damageFlash--;
    }
    
    
    const lostMobs = mobOutOfScreen();
    if (lostMobs > 0) {
        gameState.lives -= lostMobs;
        gameState.damageFlash = 10; 
    }

    if (gameState.mobs.length === 0 && gameState.waveInProgress) { //quand il plus d'ennemi et que la vague est fini
        gameState.waveInProgress = false;
        gameState.currentWave++;
        userInput.value = ""
        if(gameState.currentWave > 1){
             gameState.nextWaveMessage = `⚔ Vague ${gameState.currentWave} dans 2 secondes...`;
             gameState.nextWaveMessageTimer = 200;
        }
       
        //on commence a faire apparaitre les nouveaux monstres
        setTimeout(() => {
            
            gameState.spawnDelay = Math.max(200, gameState.spawnDelay - 100); 
            const nbMobs = gameState.mobsPerWave + gameState.currentWave;
            generateWave(nbMobs);
            gameState.nextWaveMessage = ""
        }, 2000); 
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
    let minDist = canvas.height - 10 - nearestMob.posy;

    for (let mob of gameState.mobs) {
        let distToBarrier = canvas.height - 10 - mob.posy;
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
        if (mob.posy > canvas.height - 10) {
            lostCount++;
            return false;
        }
        return true;
    });

    return lostCount;
}



setInterval(draw,10);
