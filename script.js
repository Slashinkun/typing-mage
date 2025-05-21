class Monster{
    constructor(posx,posy,word,width,height){
        this.posx = posx;
        this.posy = posy;
        this.wordtoType = word;
        this.width = width;
        this.height = height;
    }
}


class Goblin extends Monster{
    constructor(posx,posy,word){
        super(posx,posy,word,10,50);
        this.frameCount = 2;
        this.frameTimer = 0;
        this.frameInterval = 20;
        this.frameIndex = 0;
    }

    draw(ctx) {
        this.drawWord(ctx);
        ctx.drawImage(
            goblinImage,
            this.frameIndex * 32, 0,    
            32, 32,                     // Taille d’une frame
            this.posx, this.posy,      // Position sur le canvas
            32, 32                      // Taille d’affichage
        );

        
    }

    drawWord(ctx){
        ctx.font = "16px serif";
        let wordWidth = ctx.measureText(this.wordtoType).width;
        let x = this.posx + 16 - wordWidth / 2;
        const y = this.posy - 10;

        //si le goblin est au bord du canvas, on replace le mot
        if (x < 0) x = 0;
        if (x > canvas.width - wordWidth) x = canvas.width - wordWidth;

        let typedLength = 0;
        if (playerTyping && this.wordtoType.startsWith(playerTyping)) {
            typedLength = playerTyping.length;
        }

        for (let i = 0; i < this.wordtoType.length; i++) {
            const char = this.wordtoType[i];
            ctx.fillStyle = i < typedLength ? "red" : "black";
            ctx.fillText(char, x, y);

            if (char === " ") {
                x += 8; // espace fixe entre mots
            } else {
                x += ctx.measureText(char).width;
            }

            
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

class Flame{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.frameIndex = 0;
        this.frameCount = 4;
        this.frameWidth = 32;
        this.frameHeight = 32;
        this.frameTimer = 0;
        this.frameInterval = 5; // vitesse d'animation
        this.finished = false;
    }

    update() {
        this.frameTimer++;
        if (this.frameTimer >= this.frameInterval) {
            this.frameTimer = 0;
            this.frameIndex++;
            if (this.frameIndex >= this.frameCount) {
                this.finished = true;
            }
        }
    }

    draw(ctx) {
        if (this.finished) return;

        ctx.drawImage(
            flameImage,
            this.frameIndex * this.frameWidth,
            0,
            this.frameWidth,
            this.frameHeight,
            this.x,
            this.y,
            this.frameWidth,
            this.frameHeight
        );
    }
}

//barrière  10px * longueur du canvas   
// hauteur du canvas - 10


const spells = [
    "ignis flamma",
    "pyra ardentis",
    "solis ignis",
    "flamora incendo",
    "flamme",
    "braise",
    "etincelle",
    "fumée",
    "chaleur",
    "incandescence",
    "cendres",
    "brasier",
    "geyserdeflamme"   
];


const canvas = document.querySelector("canvas");
canvas.width = 800;
canvas.height = 400;

const ctx = canvas.getContext("2d");
let playerTyping = "";

const playButton = document.getElementById("playButton");

playButton.addEventListener("click",() => {
    if (!gameStarted) {
        gameStarted = true;
        playButton.style.display = "none";
        document.getElementById("player").style.display = "flex"
        document.getElementById("userInput").focus(); 
        currentWave = 1
        generateWave(mobsPerWave+currentWave)
    }
});


let mobs = [];
let currentTarget = null;
let flames = [];
let lives = 9
let currentWave = 0
let spawnDelay = 1000; //temps pour spawn les montres
let mobsPerWave = 5;
let waveInProgress = false;
let nextWaveMessage = "";
let nextWaveMessageTimer = 0;
let gameStarted = false;


const goblinImage = new Image();
goblinImage.src = "assets/goblin_walk.png";

const livesImage = new Image();
livesImage.src = "assets/coeur.png";

const flameImage = new Image();
flameImage.src = "assets/fire_sprite.png";


//cree une vague de "nb" monstres
function generateWave(nb){
    const gameWidth = canvas.width - 32; 
    const spawnY = -32; 
     
    let spawnedMobs = 0;

    const spawnInterval = setInterval(() => {
        //si il ne reste plus de monstres a apparaitre
        if (spawnedMobs >= nb) {
            clearInterval(spawnInterval); //on arrete la fonction de spawn 
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
        mob.update();
    }
}



function drawMobs(){
    updateMobs();

    let sortedMobs = mobs.slice().sort((a, b) => a.posy - b.posy);

    for (let mob of sortedMobs) {
        mob.draw(ctx);
        if (mob === currentTarget) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(mob.posx - 10, mob.posy - 10, 32, 32);
        }
    }
}




//dessine sur le canvas les elements
function draw(){

    if(!gameStarted){
        return;
    }
    

    if(lives < 0){
        drawGameOver();
        return;
    }else{
        lockOnMob();
        drawBackround();
        drawMobs();
        updateFlames();
        drawFlames();
        drawBarrier();
        drawLives();
        drawNextWaveMessage();
    }
    
    
    if(mobOutOfScreen()){
        lives--;
    }

    if (mobs.length === 0 && !waveInProgress) { //quand il plus d'ennemi et que la vague est fini
        waveInProgress = true;
        currentWave++;
        if(currentWave > 1){
             nextWaveMessage = `⚔ Vague ${currentWave} dans 2 secondes...`;
             nextWaveMessageTimer = 200;
        }
       
        //on commence a faire apparaitre les nouveaux monstres
        setTimeout(() => {
            
            spawnDelay = Math.max(200, spawnDelay - 100); 
            const nbMobs = mobsPerWave + currentWave;
            generateWave(nbMobs);
            nextWaveMessage = ""
        }, 2000); 
    }
}
   

function updateFlames() {
    for (let flame of flames) {
        flame.update();
    }
    flames = flames.filter(f => !f.finished);
}

function drawFlames() {
    for (let flame of flames) {
        flame.draw(ctx);
    }
}


function drawLives(){
    
    let nbPixel = 16 * lives;
    let start = canvas.width-nbPixel;

    for(let i = 0; i < lives; i++){
        ctx.drawImage(livesImage,start + (i * 16), 0);
    }

}

//dessine l'annonce de la prochaine vague
function drawNextWaveMessage() {
    if (nextWaveMessageTimer > 0) {
        ctx.fillStyle = "white";
        ctx.font = "24px serif";
        ctx.textAlign = "center";
        ctx.fillText(nextWaveMessage, canvas.width / 2, canvas.height / 2);
        nextWaveMessageTimer--;
    }
}
    

function drawGameOver(){
    ctx.fillStyle = "white";
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);

}

//regarde le mot que l'utilisateur a tapé
function checkTyping(word){
    playerTyping = word;
    
    let targets = mobs.filter(mob => mob.wordtoType.startsWith(playerTyping)); //on cherche les monstres ou les mots correspond au mot du joueur
    if(targets.length >= 1 && playerTyping === targets[0].wordtoType) { //si il y a au moins 1 monstre
        for(let targetedMob of targets){
            flames.push(new Flame(targetedMob.posx, targetedMob.posy));
            mobs = mobs.filter(mob => !targets.includes(mob)); //on elimine les monstres qui possede le meme mot que le joueur
        } 
        playerTyping = "";
        document.getElementById("userInput").value = "";
        currentTarget = null;
    }

    
    
}
    


function drawBackround(){
    ctx.fillStyle = "green";
    ctx.fillRect(0,0,canvas.width,canvas.height);
}


//quand l'utilisateur tape au clavier
document.getElementById("userInput").addEventListener("input",(event) => {
    checkTyping(event.target.value)
});



//trouver le monstre le plus proche de la limite du jeu (barrière)
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


//changer la cible verrouillé
function lockOnMob(){
    currentTarget = mobNearBarrier();
}

function mobOutOfScreen(){
    let lost = false;

    mobs = mobs.filter(mob => {
        if (mob.posy > canvas.height + 20) {
            lost = true;
            return false;
        }
        return true;
    });

    return lost;
}


function drawBarrier(){
    ctx.fillStyle = "red";
    ctx.globalAlpha = 0.6;
    ctx.fillRect(0,canvas.height-10,canvas.width, 10);
    ctx.globalAlpha = 1;
}





setInterval(draw,10);
