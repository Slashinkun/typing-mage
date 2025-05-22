export class TypingWord{
    constructor(word, x, y) {
        this.word = word;
        this.x = x;
        this.y = y;
    }   


    draw(ctx, playerTyping,canvasWidth) {
        ctx.font = "16px serif";
        let wordWidth = ctx.measureText(this.word).width;
        let x = this.x + 16 - wordWidth / 2;

        if (x < 0) x = 0;
        if (x > canvasWidth - wordWidth) x = canvasWidth - wordWidth;

        let typedLength = 0;
        if (playerTyping && this.word.startsWith(playerTyping)) {
            typedLength = playerTyping.length;
        }

        for (let i = 0; i < this.word.length; i++) {
            const char = this.word[i];
            ctx.fillStyle = i < typedLength ? "red" : "black";
            ctx.fillText(char, x, this.y);

            if (char === " ") {
                x += 8;
            } else {
                x += ctx.measureText(char).width;
            }
        }
    }
}