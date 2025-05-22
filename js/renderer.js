const livesImage = new Image();
livesImage.src = "../assets/coeur.png";


export function drawLives(ctx,canvas,lives){
    
    let nbPixel = 16 * lives;
    let start = canvas.width-nbPixel;

    for(let i = 0; i < lives; i++){
        ctx.drawImage(livesImage,start + (i * 16), 0);
    }

}


export function drawGameOver(ctx,canvas){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = "black"
    ctx.fillRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = "white";
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);

}

export function drawBackround(ctx,canvas){
    ctx.fillStyle = "green";
    ctx.fillRect(0,0,canvas.width,canvas.height);
}

export function drawBarrier(ctx,canvas){
    ctx.fillStyle = "red";
    ctx.globalAlpha = 0.6;
    ctx.fillRect(0,canvas.height-10,canvas.width, 10);
    ctx.globalAlpha = 1;
}

//dessine l'annonce de la prochaine vague
export function drawNextWaveMessage(ctx,canvas,message,timer) {
    if (timer > 0) {
        ctx.fillStyle = "white";
        ctx.font = "24px serif";
        ctx.textAlign = "center";
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
        timer--;
    }
}

export function drawFlames(ctx,flames) {
    for (let flame of flames) {
        flame.draw(ctx);
    }
}

export function drawMobs(ctx,mobs,currentTarget){

    let sortedMobs = mobs.slice().sort((a, b) => a.posy - b.posy);

    for (let mob of sortedMobs) {
        mob.draw(ctx);
        if (mob === currentTarget) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(mob.posx - 10, mob.posy - 10, 32, 32);
        }
    }
}

export function drawHurtAnimation(ctx,canvas){
    ctx.fillStyle = "rgba(255, 0, 0, 0.4)"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
}