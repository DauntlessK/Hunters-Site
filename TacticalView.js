//substitute for overworld map

class TacticalView{
    constructor(config){
        this.gameObjects = config.gameObjects;

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;
        this.bgdFrames = config.bgdFrames;
        this.currentFrame = 0;
        this.animationFrameLimit = 16;
        this.animationFrameProgress = 16;

        //bgd image must be same size: 640x360px

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;
    }

    drawLowerImage(ctx){
        ctx.drawImage(this.lowerImage,
            this.currentFrame * 640, 0,
            640, 360,
            0, 0,
            640, 360
          )
        //this.updateAnimationProgress();        

    }

    drawUpperImage(ctx){
        ctx.drawImage(this.upperImage,
            0, 0,
            640, 360,
            0, 0,
            640, 360
          )
        this.updateAnimationProgress();        

    }

    updateAnimationProgress(){
        //Downtick frame progress
        this.animationFrameProgress -= 1;
        //Check to see if frame limit is 0, if it is, roll to next frame
        if (this.animationFrameProgress === 0){
            this.currentFrame += 1;
            if (this.currentFrame == this.bgdFrames -1){
                this.currentFrame = 0;
            }
            this.animationFrameProgress = this.animationFrameLimit;
        }
    }


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
        lowerSrc: "images/scrollingwater_spritesheet.png",
        upperSrc: "images/deepwater.png",
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