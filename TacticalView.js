//substitute for overworld map

class TacticalView{
    constructor(config){
        this.gameObjects = config.gameObjects;

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;
        this.bgdFrames = config.bgdFrames;
        this.currentFrame = 0;

        //bgd image must be same size: 640x360px

        //this.upperImage = new Image();
        //this.upperImage.src = config.upperSrc;
    }

    drawLowerImage(ctx){
        //ctx.drawImage(this.lowerImage, 0, 0)
        ctx.drawImage(this.lowerImage,
            this.currentFrame * 640, 0,
            640, 360,
            0, 0,
            640, 360
          )
        this.currentFrame += 1;
        if (this.currentFrame >= this.bgdFrames){
            this.currentFrame = 0;
        }
    }

    /**drawUpperImage(ctx){
        ctx.drawImage(this.drawUpperImage, 0, 0)
    }**/

}

window.Scenes = {
    Port: {
        lowerSrc: "images/scrollingwater.gif",
        gameObjects: {
            sub: new GameObject({
                x: 20,
                y: 200,
                src: "images/ships/Uboat_VIIC_spritesheet.png",
                width: 455,
                height: 85,
                frames: 48
            })
        }
    },
    Sunny: {
        lowerSrc: "images/scrollingwater.gif",
        bgdFrames: 49,
        gameObjects: {
            sub: new GameObject({
                x: 5,
                y: 230,
                src: "images/ships/Uboat_VIIC_spritesheet.png",
                width: 455,
                height: 85,
                frames: 48
            })
        }
    }
}