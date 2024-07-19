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
        this.mainUI.reloadButton.changeState("Enable")
    }

    commitReload() {
        this.reloadMode = false;
        for (let i = 1; i < 7; i++) {
            this.mainUI.tubeButtonArray[i].getLatestState();
        }
    }

    setDeparted(val) {
        this.isDeparted = val;
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
        if (state == true) {
            for (let i = 1; i < 7; i++) {
                this.mainUI.tubeButtonArray[i].changeState("Enabled");
            }
        }
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
            this.lowerImage.src = "images/scrollingwater_spritesheet.png";
        }
        else {
            this.lowerImage.src = "images/scrollingwater_NIGHT_spritesheet.png";
        }
    }

    //draw lowest layer of background
    drawLowerImage(ctx){
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
    //called to change the scene, responsible for background and sprites on background
    changeScene(newScene, newTime, shipList, timeChangeOnly){

        if (newScene != "IntroPort" || newScene != "Port") {
            this.setTimeOfDay(newTime);
            if (timeChangeOnly) {
                return;
            }
        }

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
            case "Ship":
                this.upperImage.src = "images/deepwater.png",
                this.bgdFrames = 49,
                this.gameObjects = {
                    uboat: new GameObject({
                        x: 0,
                        y: 200,
                        src: "images/ships/Uboat_VIIC_spritesheet2.png",
                        width: 803,
                        height: 95,
                        frames: 49,
                        isPlayer: true
                    }),
                    ship0: new GameObject({
                        x: 300,
                        y: 10,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 0,
                        width: 201,
                        height: 158,
                        frames: 6,
                        isPlayer: false,
                        shipList: shipList
                    })
                }
                break;
            case "Ship + Escort":
                this.upperImage.src = "images/deepwater.png",
                this.bgdFrames = 49,
                this.gameObjects = {
                    uboat: new GameObject({
                        x: 0,
                        y: 200,
                        src: "images/ships/Uboat_VIIC_spritesheet2.png",
                        width: 803,
                        height: 95,
                        frames: 49,
                        isPlayer: true
                    }),
                    ship0: new GameObject({
                        x: 740,
                        y: 50,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 0,
                        width: 201,
                        height: 158,
                        frames: 6,
                        isPlayer: false,
                        shipList: shipList
                    }),
                    ship1: new GameObject({
                        x: 500,
                        y: 10,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 1,
                        width: 201,
                        height: 158,
                        frames: 6,
                        isPlayer: false,
                        shipList: shipList
                    })
                }
                break;
            case "Convoy":
                this.upperImage.src = "images/deepwater.png",
                this.bgdFrames = 49,
                this.gameObjects = {
                    uboat: new GameObject({
                        x: 0,
                        y: 200,
                        src: "images/ships/Uboat_VIIC_spritesheet2.png",
                        width: 803,
                        height: 95,
                        frames: 49,
                        isPlayer: true
                    }),
                    ship0: new GameObject({
                        x: 740,
                        y: 50,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 0,
                        width: 201,
                        height: 158,
                        frames: 6,
                        isPlayer: false,
                        shipList: shipList
                    }),
                    ship1: new GameObject({
                        x: 680,
                        y: 10,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 1,
                        width: 201,
                        height: 158,
                        frames: 6,
                        isPlayer: false,
                        shipList: shipList
                    }),
                    ship2: new GameObject({
                        x: 460,
                        y: 10,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 2,
                        width: 201,
                        height: 158,
                        frames: 6,
                        isPlayer: false,
                        shipList: shipList
                    }),
                    ship3: new GameObject({
                        x: 240,
                        y: 10,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 3,
                        width: 201,
                        height: 158,
                        frames: 6,
                        isPlayer: false,
                        shipList: shipList
                    }),
                    ship4: new GameObject({
                        x: 20,
                        y: 10,
                        src: "images/ships/CargoShip1.png",  //"images/ships/CargoShip1.png"
                        shipNum: 4,
                        width: 201,
                        height: 158,
                        frames: 6,
                        isPlayer: false,
                        shipList: shipList
                    })
                }
                break;
            default:
                this.upperImage.src = "images/deepwater.png",
                this.bgdFrames = 49,
                this.gameObjects = {
                    uboat: new GameObject({
                        x: 0,
                        y: 200,
                        src: "images/ships/Uboat_VIIC_spritesheet2.png",
                        width: 803,
                        height: 95,
                        frames: 1,
                        isPlayer: true
                    })
                }
                break;
        }
        //update tv on each sprite
        Object.values(this.gameObjects).forEach(object => {
            object.sprite.updateTV(this);
        })
    }
}