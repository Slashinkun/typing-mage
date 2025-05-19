class Monster{
    constructor(posx,posy){
        this.posx = posx
        this.posy = posy
    }
}


class Goblin extends Monster{
    constructor(posx,posy){
        super(posx,posy)
    }

    draw(ctx) {
        ctx.fillStyle = "green"
        
        ctx.fillRect(this.posx,this.posy,10,10)
    }
}




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
let randomSpell = ""
let spellState = []
let mobs = []

function generateRandomMob(nb){
    const gameWidth = canvas.width
    const gameheight = canvas.height
    for(let i = 0; i < nb; i++){
        let randomPosX = Math.floor(Math.random() * gameWidth)
        let randomPosY = Math.floor(Math.random() * gameheight)
        mobs.push(new Goblin(randomPosX, randomPosY))
    }
}

function updateMobs(){
    for(let mob of mobs){
        mob.posy +=1
    }
}

function chooseRandomSpell(){
    randomSpell = spells[Math.floor(Math.random() * spells.length)]
    spellState = Array(randomSpell.length).fill(false);
}

function drawMobs(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //updateMobs()
        for(let mob of mobs ){
            mob.draw(ctx)
        }
}

function drawHUD(){
    ctx.fillStyle = "black"
    ctx.font = "20px serif"
    let x = canvas.width/2;
    const y = 50;
    

    for(let i = 0; i < randomSpell.length; i++) {
        const char = randomSpell[i];
        ctx.fillStyle = spellState[i] ? "red" : "black";
        ctx.fillText(char, x, y);
        const letterWidth = ctx.measureText(char).width;
        x += letterWidth + 5;
    }
  
}
    


function draw(){
    drawMobs()
    drawHUD()
}

function checkTyping(word){
    spellState = []
        for(let i = 0; i < randomSpell.length; i++){
             spellState[i] = (word[i] === randomSpell[i]);
        }

        if(word === randomSpell){
            document.getElementById("userInput").value = ""
            killMob()
            chooseRandomSpell()
            drawHUD()
        }
    
}

function killMob(){
    let randomMobIndex = Math.floor(Math.random() * mobs.length)
    mobs.splice(randomMobIndex,1)
}



document.getElementById("userInput").addEventListener("input",(event) => {
    checkTyping(event.target.value)
})




chooseRandomSpell()
generateRandomMob(10)
drawMobs()
//console.log(mobs)
setInterval(draw,10)
