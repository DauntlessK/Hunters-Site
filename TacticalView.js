//substitute for overworld map

class TacticalView{
    constructor(startScene){
        this.gm = new GameManager(this);
        this.mainUI = null;
        this.scene = startScene;
        this.isPaused = false;
        this.reloadMode = false;
        this.statusMode = false;

        //For encounter attacking
        this.firingMode = false;
        this.isInEncounter = false;
        this.isDeparted = false; //used to track after reloading whether the boat leaves port, or simply finishes reload
        this.currentTarget = -1;

        this.lowerImage = new Image();
        this.upperImage = new Image();
        this.timeOverlayImage = new Image();

        //create uboat player object- (Initial state is large for port)
        this.uboat = new SpriteUboat({
            tv: this,
            gm: this.gm,
            x: 137,
            y: 392,
            src: "images/ships/Uboat_VIIC_spritesheet.png",
            width: 803,
            height: 95,
            frames: 1,
            isPlayer: true
        });

        //create wake water object
        this.uboatwake = new SpriteWake({
            tv: this,
            gm: this.gm,
            x: -58,
            y: -5,
            src: "images/water/portscene_waterline_spritesheet.png",
            width: 1280,
            height: 720,
            frames: 24,
        })

        this.waves = null;

        this.shipObjects = null;
        this.gameObjects = null;

        this.currentFrame = 0;
        this.animationFrameLimit = 16;
        this.animationFrameProgress = 16;

        //bgd image must be same size: 1280x720px

        //handle intial scene
        this.changeScene(this.scene);

        //weather images and tod
        this.weather1 = null;
        this.weather2 = null;
        this.time = "Day";

        this.nextTranslationTimer = 0;
        this.totalTranslation = 0;
        this.setNewTranslation();
    }

    pauseGame(state){
        this.isPaused = state;
    }

    enterReloadMode() {
        this.reloadMode = true;
        this.mainUI.reloadButton.changeState("Enable");
    }

    commitReload() {
        this.reloadMode = false;
        for (let i = 1; i < 7; i++) {
            this.mainUI.tubeButtonArray[i].getLatestState();
        }
    }

    setDeparted(val) {
        this.isDeparted = val;
        if (val == true ) {
            this.uboat.setDeparted();
            this.uboatwake.setDeparted();
        }
    }

    enterEncounter(){
        this.isInEncounter = true;
    }

    finishEncounter() {
        this.currentTarget = -1;
        this.isInEncounter = false;
    }

    setStatusMode(state) {
        this.statusMode = state;
    }

    setFiringMode(state) {
        this.firingMode = state;
        this.currentTarget = -1;
    }

    //sets the currently selected target in which to assign torpedoes to
    selectTarget(shipNum) {
        if (this.currentTarget == shipNum) {
            this.currentTarget = -1;
        }
        else {
            this.currentTarget = shipNum;
        }
    }

    //Returns the currently selected target
    getSelectedTarget() {
        return this.currentTarget;
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

    //Called when start game button is clicked on HTML. Creates gm (and thus sub), and UI
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

    getNewWeather() {
        if (newScene == "Random") {
            const sceneArray = ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Foggy", "Stormy"] //adjust to 2xd6 roll and assign likely values
        }

    }

    setTimeOfDay(time) {
        this.time = time;

        if (time == "Day") {
            this.timeOverlayImage.src = "images/blank.png";
        }
        else {
            this.timeOverlayImage.src = "images/night_overlay.png";
        }
    }

    //draw lowest layer of background
    drawLowerImage(ctx){
        //console.log(this.currentFrame);             //Neat - shows 16 steps before advancing to next frame
        ctx.drawImage(this.lowerImage,
            this.currentFrame * 1280, 0,
            1280, 720,
            0, 0,
            1280, 720
          )
    }

    //draw layer above background
    drawUpperImage(ctx){
        ctx.drawImage(this.upperImage,
            0, 0,
            1280, 720,
            0, 0,
            1280, 720
          )   
    }

    //Draws dark layer for night
    drawNightOverlayImage(ctx) {
        ctx.drawImage(this.timeOverlayImage,
            0, 0,
            1280, 720,
            0, 0,
            1280, 720
          ) 
    }

    //draws weather layers
    drawWeather(ctx) {

    }

    //calls UI to draw elements (buttons, text, UI bgd)
    drawUI(ctx){
        this.mainUI.draw(ctx);
    }

    updateAnimationProgress(){
        //check to animate if the game is not in a paused state
        if (this.isPaused == false) {
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

    /**
     * Called to change the scene, responsible for background and sprites on background
     * @param {string} newScene - scene type ("Port", "Ship", "Convoy", etc)
     * @param {boolean} newTime - Time of day of scene
     * @param {encounter} enc - Encounter object
     * @param {boolean} timeChangeOnly - true only if simply updating time of day
     * @returns 
     */
    async changeScene(newScene, newTime, enc, timeChangeOnly){

        //If last (current) scene was Port and changing scenes
        //For starting patrol - Changing to animated move scenes
        if (this.scene == "Port") {
            this.lowerImage.src = "images/water/scrollingwater_spritesheet.png";

            //Set new Uboat loc, frames and size
            this.uboat.x = 0;
            this.uboat.y = 200;
            this.uboat.frames = 33;
            this.uboatwake.x = 0;
            this.uboatwake.y = 249;
            this.uboat.height = 150;

            //Set new Uboat wake for on patrol moving
            this.uboatwake.updateSprite("images/water/UboatWake_spritesheet.png");
            this.uboatwake.width = 944;
            this.uboatwake.height = 120;
            this.uboatwake.setNewFrameCount(30);
            this.uboatwake.setNewFrameLimit(16);

            this.waves = new Sprite({
                tv: this,
                gm: this.gm,
                x: 0,
                y: 245,
                src: "images/water/WavesOnly_spritesheet.png",
                width: 944,
                height: 60,
                frames: 30
            })
        }

        //If scene is port, blank overlay, otherwise configure time of day and change uboat wake, add waves
        if (newScene == "IntroPort" || newScene == "Port") {
            this.timeOverlayImage.src = "images/blank.png";
            this.waves = null;
        }
        else {
            console.log("Scene: " + newScene + " | Scene Time: " + newTime);        //debug ToD
            this.setTimeOfDay(newTime);
            if (timeChangeOnly) {
                return;
            }
        }
        
        this.scene = newScene;
        switch (newScene){
            case "IntroPort":
                this.shipObjects = null;
                this.lowerImage.src = "images/portscene_spritesheet.png";
                this.upperImage.src = "images/logo.png";
                this.timeOverlayImage.src = "images/blank.png";
                this.bgdFrames = 30;
                this.uboatwake.updateSprite("images/water/portscene_waterline_spritesheet.png");
                this.uboatwake.width = 1280;
                this.uboatwake.height= 720;

                //create wake water object
                this.uboatwake = new SpriteWake({
                    tv: this,
                    gm: this.gm,
                    x: -58,
                    y: -5,
                    src: "images/water/portscene_waterline_spritesheet.png",
                    width: 1280,
                    height: 720,
                    frames: 24,
                })
                break;
            case "Port":
                this.shipObjects = null;
                this.lowerImage.src = "images/portscene_spritesheet.png";
                this.upperImage.src = "images/blank.png";
                this.timeOverlayImage.src = "images/blank.png";
                this.isDeparted = false;
                this.bgdFrames = 30;
                this.currentFrame = 0;

                this.uboat = new SpriteUboat({
                    tv: this,
                    gm: this.gm,
                    x: 137,
                    y: 392,
                    src: "images/ships/Uboat_VIIC_spritesheet.png",
                    width: 803,
                    height: 95,
                    frames: 1,
                    isPlayer: true
                });
        
                //create wake water object
                this.uboatwake = new SpriteWake({
                    tv: this,
                    gm: this.gm,
                    x: -58,
                    y: -5,
                    src: "images/water/portscene_waterline_spritesheet.png",
                    width: 1280,
                    height: 720,
                    frames: 24,
                })
                break;
            case "Ship":
                this.upperImage.src = "images/water/deepwater.png";
                this.bgdFrames = 49;
                this.gameObjects = null;
                this.shipObjects = {
                    ship0: new SpriteShip({
                        tv: this,
                        gm: this.gm,
                        x: 300,
                        y: 10,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 0,
                        width: 201,
                        height: 158,
                        frames: 6,
                        encounter: enc
                    })
                }
                break;
            case "Ship + Escort":
                this.upperImage.src = "images/water/deepwater.png";
                this.bgdFrames = 49;
                this.gameObjects = null;
                this.shipObjects = {
                    ship0: new SpriteShip({
                        tv: this,
                        gm: this.gm,
                        x: 740,
                        y: 50,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 0,
                        width: 201,
                        height: 158,
                        frames: 6,
                        encounter: enc
                    }),
                    ship1: new SpriteShip({
                        tv: this,
                        gm: this.gm,
                        x: 500,
                        y: 10,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 1,
                        width: 201,
                        height: 158,
                        frames: 6,
                        encounter: enc
                    })
                }
                break;
            case "Convoy":
                this.upperImage.src = "images/water/deepwater.png";
                this.bgdFrames = 49;
                this.gameObjects = null;
                this.shipObjects = {
                    ship0: new SpriteShip({
                        tv: this,
                        gm: this.gm,
                        x: 740,
                        y: 50,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 0,
                        width: 201,
                        height: 158,
                        frames: 6,
                        encounter: enc
                    }),
                    ship1: new SpriteShip({
                        tv: this,
                        gm: this.gm,
                        x: 680,
                        y: 10,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 1,
                        width: 201,
                        height: 158,
                        frames: 6,
                        encounter: enc
                    }),
                    ship2: new SpriteShip({
                        tv: this,
                        gm: this.gm,
                        x: 460,
                        y: 10,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 2,
                        width: 201,
                        height: 158,
                        frames: 6,
                        encounter: enc
                    }),
                    ship3: new SpriteShip({
                        tv: this,
                        gm: this.gm,
                        x: 240,
                        y: 10,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 3,
                        width: 201,
                        height: 158,
                        frames: 6,
                        encounter: enc
                    }),
                    ship4: new SpriteShip({
                        tv: this,
                        gm: this.gm,
                        x: 20,
                        y: 10,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 4,
                        width: 201,
                        height: 158,
                        frames: 6,
                        encounter: enc
                    })
                }
                break;
            case "Aircraft":
                this.upperImage.src = "images/water/deepwater.png";
                this.bgdFrames = 49;
                this.gameObjects = {
                    aircraft: new Sprite({
                        tv: this,
                        gm: this.gm,
                        x: 300,
                        y: 40,
                        src: "images/aircraft/Aircraft.png",  //"images/ships/CargoShip1.png"
                        shipNum: 0,
                        width: 50,
                        height: 50,
                        frames: 1,
                        encounter: enc
                    })
                }
                this.shipObjects = null;
                break;
            case "Escort":
                this.upperImage.src = "images/water/deepwater.png";
                this.bgdFrames = 49;
                this.gameObjects = null;
                this.shipObjects = {
                    ship0: new SpriteShip({
                        tv: this,
                        gm: this.gm,
                        x: 300,
                        y: 10,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 0,
                        width: 201,
                        height: 158,
                        frames: 6,
                        encounter: enc
                    })
                }
                break;
            case "Capital Ship":
                this.upperImage.src = "images/water/deepwater.png";
                this.bgdFrames = 49;
                this.gameObjects = null;
                this.shipObjects = {
                    ship0: new SpriteShip({
                        tv: this,
                        gm: this.gm,
                        x: 740,
                        y: 50,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 0,
                        width: 201,
                        height: 158,
                        frames: 6,
                        encounter: enc
                    }),
                    ship1: new SpriteShip({
                        tv: this,
                        gm: this.gm,
                        x: 500,
                        y: 10,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 1,
                        width: 201,
                        height: 158,
                        frames: 6,
                        encounter: enc
                    })
                }
                break;
            default:
                this.upperImage.src = "images/water/deepwater.png";
                this.bgdFrames = 49;
                this.gameObjects = null;
                this.shipObjects = null;
                break;
        }
    }
}