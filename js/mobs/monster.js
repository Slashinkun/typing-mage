export class Monster{
    constructor(posx,posy,word,width,height){
        this.posx = posx;
        this.posy = posy;
        this.wordtoType = word;
        this.width = width;
        this.height = height;
    }

    draw(ctx){console.error("Peux pas dessiner le monstre")}

    drawWord(ctx){}

    update(){}

}