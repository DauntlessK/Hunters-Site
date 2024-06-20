//substitute for overworld map

class TacticalView{
    constructor(startScene){
        this.gm = new GameManager(this);
        this.mainUI = null;
        this.scene = startScene;
        this.isUnpaused = true;
        this.reloadMode = false;

        this.lowerImage = new Image();
        this.upperImage = new Image();

        this.currentFrame = 0;
        this.animationFrameLimit = 16;
        this.animationFrameProgress = 16;

        //bgd image must be same size: 1280x720px

        //handle intial scene
        this.changeScene(this.scene);

        this.nextTranslationTimer = 0;
        this.totalTranslation = 0;
        this.setNewTranslation();
    }

    pauseGame(){
        this.isUnpaused = false;
    }

    unpauseGame(){
        this.isUnpaused = true;
    }

    handleEvent(){
        if (this.mainUI != null){
            this.mainUI.handleEvent(event);
          }
    }

    setNewTranslation(){
        this.nextTranslationTimer = Math.floor(Math.random() * (250 - 100)) + 100;
        this.totalTranslation = Math.floor(Math.random() * (10 - -10)) + -10;
    }

    getTotalTranslation(){
        return this.totalTranslation;
    }

    startGame(kmdtTextField, numField, subType){
        //create game manager 
        this.gm.startGame(kmdtTextField, numField, subType);

        //create UI object
        this.mainUI = new UI({
            src: "images/ui/uibgd.png",
            tv: this,
            gm: this.gm
        });
    }

    drawLowerImage(ctx){
        //draw lowest layer of background
        ctx.drawImage(this.lowerImage,
            this.currentFrame * 1280, 0,
            1280, 720,
            0, 0,
            1280, 720
          )
    }

    drawUpperImage(ctx){
        //draw layer above background
        ctx.drawImage(this.upperImage,
            0, 0,
            1280, 720,
            0, 0,
            1280, 720
          )   
    }

    drawUI(ctx){
        //calls UI to draw elements (buttons, text, UI bgd)
        this.mainUI.draw(ctx);
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
        //called to change the scene, responsible for background and sprites on background
        this.scene = newScene;
        switch (newScene){
            case "IntroPort":
                this.lowerImage.src = "images/portscene_spritesheet.png";
                this.upperImage.src = "images/logo.png";
                this.bgdFrames = 30,
                this.gameObjects = {
                    uboat: new GameObject({
                        x: 137,
                        y: 392,
                        src: "images/ships/Uboat_VIIC_spritesheet2.png",
                        width: 803,
                        height: 95,
                        frames: 1,
                        isPlayer: true
                    }),
                    waterline: new GameObject({
                        x: -58,
                        y: -5,
                        src: "images/portscene_waterline_spritesheet.png",
                        width: 1280,
                        height: 720,
                        frames: 24,
                        isPlayer: false
                    })
                }
                break;
            case "Port":
                this.lowerImage.src = "images/portscene_spritesheet.png";
                this.upperImage.src = "images/blank.png";
                this.bgdFrames = 30,
                this.gameObjects = {
                    uboat: new GameObject({
                        x: 137,
                        y: 392,
                        src: "images/ships/Uboat_VIIC_spritesheet2.png",
                        width: 803,
                        height: 95,
                        frames: 1,
                        isPlayer: true
                    }),
                    waterline: new GameObject({
                        x: -58,
                        y: -5,
                        src: "images/portscene_waterline_spritesheet.png",
                        width: 1280,
                        height: 720,
                        frames: 24,
                        isPlayer: false
                    })
                }
                break;
            case "Sunny":
                this.lowerImage.src = "images/scrollingwater_spritesheet.png",
                this.upperImage.src = "images/deepwater.png",
                this.bgdFrames = 49,
                this.gameObjects = {
                    uboat: new GameObject({
                        x: 0,
                        y: 280,
                        src: "images/ships/Uboat_VIIC_spritesheet2.png",
                        width: 803,
                        height: 95,
                        frames: 1,
                        isPlayer: true
                    })
                }
        }
        //update tv on each sprite
        Object.values(this.gameObjects).forEach(object => {
            object.sprite.updateTV(this);
        })
    }
}