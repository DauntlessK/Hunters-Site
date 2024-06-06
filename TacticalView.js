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

        //bgd image must be same size: 1280x720px

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;

        //UI
        this.mainUI = new UI({
            src: "images/ui/uibgd.png"
        });
    }

    handleEvent(){
        this.mainUI.handleEvent(event);
    }

    drawLowerImage(ctx){
        ctx.drawImage(this.lowerImage,
            this.currentFrame * 1280, 0,
            1280, 720,
            0, 0,
            1280, 720
          )
    }

    drawUpperImage(ctx){
        ctx.drawImage(this.upperImage,
            0, 0,
            1280, 720,
            0, 0,
            1280, 720
          )   
    }

    drawUI(ctx){
        this.mainUI.draw(ctx);
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
                x: 15,
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
        UI: this.mainUI,
        bgdFrames: 49,
        gameObjects: {
            sub: new GameObject({
                x: 0,
                y: 460,
                src: "images/ships/Uboat_VIIC_spritesheet.png",
                width: 803,
                height: 150,
                frames: 48
            })
        }
    }
}