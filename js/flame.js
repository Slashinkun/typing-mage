const flameImage = new Image();
flameImage.src = "../assets/fire_sprite.png";

export class Flame{
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