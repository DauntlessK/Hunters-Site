//substitute for overworld map

class TacticalView{
    constructor(startScene){
        //this.gameObjects = config.gameObjects;
        this.gm = new GameManager(this);
        this.scene = startScene;
        this.isUnpaused = true;

        this.lowerImage = new Image();
        this.upperImage = new Image();

        this.currentFrame = 0;
        this.animationFrameLimit = 16;
        this.animationFrameProgress = 16;

        //bgd image must be same size: 1280x720px

        //handle intial scene
        this.changeScene(this.scene);

        //UI
        this.mainUI = new UI({
            src: "images/ui/uibgd.png",
            tv: this,
            gm: this.gm
        });
    }

    pauseGame(){
        this.isUnpaused = false;
    }

    unpauseGame(){
        this.isUnpaused = true;
    }

    handleEvent(){
        this.mainUI.handleEvent(event);
    }

    startGame(kmdtTextField, numField, subType){
        this.gm.startGame(kmdtTextField, numField, subType);
    }

    drawLowerImage(ctx){
        if (this.scene === "Port"){
            this.currentFrame = 0;
        }
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
        //check to animate if the game is not in a paused state
        if (this.isUnpaused == true) {
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

    changeScene(newScene){
        switch (newScene){
            case "Port":
                this.lowerImage.src = "images/portscene.png";
                this.upperImage.src = "images/logo.png";
                this.gameObjects = {
                    sub: new GameObject({
                        x: 200,
                        y: 420,
                        src: "images/ships/Uboat_VIIC_spritesheet.png",
                        width: 803,
                        height: 95,
                        frames: 1,
                    })
                }
                break;
            case "Sunny":
                this.lowerImage.src = "images/scrollingwater_spritesheet.png",
                this.upperImage.src = "images/deepwater.png",
                this.bgdFrames = 49,
                this.gameObjects = {
                    sub: new GameObject({
                        x: 0,
                        y: 460,
                        src: "images/ships/Uboat_VIIC_spritesheet.png",
                        width: 803,
                        height: 150,
                        frames: 48,
                    })
                }
        }
        //update tv on each sprite
        Object.values(this.gameObjects).forEach(object => {
            object.sprite.updateTV(this);
        })
    }
}