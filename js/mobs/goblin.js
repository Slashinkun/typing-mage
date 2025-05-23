import { Monster } from "./monster.js";
import { gameState } from "../gameState.js";
import { TypingWord } from "../typingWord.js";

const goblinImage = new Image();
goblinImage.src = "/typing-mage/assets/goblin_walk.png";


export class Goblin extends Monster{
    constructor(posx,posy,word){
        super(posx,posy,word,32,32);
        this.wordDisplay = new TypingWord(word,posx,posy-10)
        this.frameCount = 2; //nombre de frame du sprite
        this.frameTimer = 0;
        this.frameInterval = 20;
        this.frameIndex = 0;
    }

    draw(ctx) {
         this.wordDisplay.x = this.posx; // on met à jour la position
         this.wordDisplay.y = this.posy - 10;
         this.wordDisplay.draw(ctx, gameState.playerTyping);
        ctx.drawImage(
            goblinImage,
            this.frameIndex * 32, 0,    
            32, 32,                     // Taille d’une frame
            this.posx, this.posy,      // Position sur le canvas
            32, 32                      // Taille d’affichage
        );

        
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


