import { Monster } from "./monster.js";
import { TypingWord } from "../typingWord.js";
import { gameState } from "../gameState.js";
export class Orc extends Monster{
    constructor(posx,posy,word){
        super(posx,posy,word,64,64);
        this.wordDisplay = new TypingWord(word,posx,posy-10)
        this.frameCount = 2; //nombre de frame du sprite
        this.frameTimer = 0;
        this.frameInterval = 20;
        this.frameIndex = 0;
    }

    draw(ctx){
        this.wordDisplay.x = this.posx; // on met à jour la position
        this.wordDisplay.y = this.posy - 10;
        this.wordDisplay.draw(ctx, gameState.playerTyping);
        ctx.fillStyle = "red"
        ctx.fillRect(this.posx,this.posy,64,64)
    }

    update(){
        this.posy += 0.1; 

        this.frameTimer++;
        if (this.frameTimer >= this.frameInterval) {
            this.frameIndex = (this.frameIndex + 1) % this.frameCount;
            this.frameTimer = 0;
        }
    }
}