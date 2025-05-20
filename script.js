class Monster{
    constructor(posx,posy,word,width,height){
        this.posx = posx
        this.posy = posy
        this.wordtoType = word
        this.width = width
        this.height = height
    }
}


class Goblin extends Monster{
    constructor(posx,posy,word){
        super(posx,posy,word,10,50)
        this.frameCount = 2;
        this.frameTimer = 0;
        this.frameInterval = 20;
        this.frameIndex = 0
    }

    draw(ctx) {
        ctx.drawImage(
            goblinImage,
            this.frameIndex * 32, 0,    
            32, 32,                     // Taille d’une frame
            this.posx, this.posy,      // Position sur le canvas
            32, 32                      // Taille d’affichage
        );

        this.drawWord(ctx);
    }

    drawWord(ctx){
        ctx.font = "16px serif";
        let x = this.posx -30;
        const y = this.posy - 10;
        let typedLength = 0;
        if (playerTyping && this.wordtoType.startsWith(playerTyping)) {
            typedLength = playerTyping.length;
        }

        for (let i = 0; i < this.wordtoType.length; i++) {
            ctx.fillStyle = i < typedLength ? "red" : "black";
            ctx.fillText(this.wordtoType[i], x, y);
            x += ctx.measureText(this.wordtoType[i]).width;
        }
    }

    
    

    update(){
        this.posy += 0.2; 

        this.frameTimer++;
        if (this.frameTimer >= this.frameInterval) {
            this.frameIndex = (this.frameIndex + 1) % this.frameCount;
            this.frameTimer = 0;
        }
    }
}


//barrière  10px * longueur du canvas   
// hauteur du canvas - 10


const spells = [
    "ignis flamma",
    "pyra ardentis",
    "solis ignis",
    "flamora incendo"
]




const canvas = document.querySelector("canvas")
canvas.width = 800
canvas.height = 400

const ctx = canvas.getContext("2d")
let playerTyping = ""


let mobs = []
let lives = 5
let currentWave = 1
let spawnDelay = 1000;
let mobsPerWave = 5;
let waveInProgress = false


const goblinImage = new Image();
goblinImage.src = "assets/goblin_walk.png";

function generateWave(nb){
    const gameWidth = canvas.width - 32; 
    const spawnY = -32; 
     
    let spawnedMobs = 0;

    const spawnInterval = setInterval(() => {
        if (spawnedMobs >= nb) {
            clearInterval(spawnInterval); 
            waveInProgress = false;
            return;
        }
    
    const gameWidth = canvas.width - 32;
    const spawnY = -32;

    const randomWord = spells[Math.floor(Math.random() * spells.length)];
    const randomPosX = Math.floor(Math.random() * gameWidth);

    mobs.push(new Goblin(randomPosX, spawnY, randomWord));
    spawnedMobs++;
    }, spawnDelay)
}

function updateMobs(){
    for(let mob of mobs){
        mob.update()
    }
}



function drawMobs(){
    updateMobs()
    for(let mob of mobs ){
        mob.draw(ctx)
        if (mob === currentTarget){
            ctx.strokeStyle = "red"
            ctx.strokeRect(mob.posx-10,mob.posy-10,32,32)
        }
    }
}





function draw(){
    lockOnMob()
    drawBackround()
    drawMobs()
    drawBarrier()

    if (mobs.length === 0 && !waveInProgress) {
        setTimeout(() => {
            currentWave++;
            spawnDelay = Math.max(200, spawnDelay - 100); 
            const nbMobs = mobsPerWave + currentWave;
            generateWave(currentWave, nbMobs, spawnDelay);
        }, 2000); 
    }
    }
   
    
    


function checkTyping(word){
    playerTyping = word
    let targets = mobs.filter(mob => mob.wordtoType.startsWith(playerTyping));
    console.log(targets)
    if(targets.length >= 1 && playerTyping === targets[0].wordtoType) {
        for(let targetedMob of targets){
            console.log("Inchallah ça filtre")
            mobs = mobs.filter(mob => !targets.includes(mob));
        } 
        playerTyping = "";
        document.getElementById("userInput").value = "";
        currentTarget = null;
    }

    
    
}
    


function drawBackround(){
    ctx.fillStyle = "green"
    ctx.fillRect(0,0,canvas.width,canvas.height)
}

function killMob(){
    let randomMobIndex = Math.floor(Math.random() * mobs.length)
    mobs.splice(randomMobIndex,1)
}



document.getElementById("userInput").addEventListener("input",(event) => {
    checkTyping(event.target.value)
})




function mobNearBarrier(){
    if(mobs.length === 0) return null;

    let nearestMob = mobs[0];
    let minDist = canvas.height - 10 - nearestMob.posy;

    for (let mob of mobs) {
        let distToBarrier = canvas.height - 10 - mob.posy;
        if (distToBarrier >= 0 && distToBarrier < minDist) {
            nearestMob = mob;
            minDist = distToBarrier;
        }
    }

    return nearestMob;
}

function lockOnMob(){
    currentTarget = mobNearBarrier()
}

function mobOutOfScreen(){
    for(let mob of mobs){
        if(mob.posy > canvas.height+10){
            return true
        }
    }

    return false
}


function drawBarrier(){
    ctx.fillStyle = "red"
    ctx.globalAlpha = 0.5
    ctx.fillRect(0,canvas.height-10,canvas.width, 10)
    ctx.globalAlpha = 1
}


let currentTarget = null;


setInterval(draw,10)
