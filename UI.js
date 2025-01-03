class UI{
    constructor(config){
        this.gm = config.gm;
        this.tv = config.tv;

        this.bgdUI = new Image();
        this.src = config.src;

        this.width = 1280;
        this.height = 720;

        this.uiBgd = new Image();
        this.uiBgd.src = "images/ui/uibgd.png";

        this.uiBgd.onload = () => {
            this.isLoaded = true;
        }

        this.tubeButtonArray = [0];

        var xArray = [];
        var yArray = [];

        //create x and y arrays for torpedo button locations
        if (this.gm.sub.getType() == "IXA" || this.gm.sub.getType() == "IXB") { 
            xArray = [0, 1007, 1110, 1007, 1110, 1007, 1110];
            yArray = [0, 245, 245, 341, 341, 449, 449];
        }
        else {
            xArray = [0, 1007, 1110, 1007, 1110, 1057, 2000];
            yArray = [0, 245, 245, 341, 341, 449, 2000];
        }

        //create array of torpedo buttons
        for (let i = 1; i < 7; i++){
            const button = new TorpedoButton({
                src: "images/ui/TorpButton.png",
                x: xArray[i],
                y: yArray[i],
                width: 100,
                height: 100,
                frames: 8,
                tube: i,
                gm: this.gm,
                tv: this.tv
        })
            this.tubeButtonArray.push(button)
        }

        //create buttons
        this.reloadButton = new ReloadButton({
            src: "images/ui/CommitButton.png",
            x: 1057,
            y: 650,
            width: 100,
            height: 50,
            frames: 2,
            gm: this.gm,
            tv: this.tv,
        });
        this.beginPatrolButton = new BeginPatrolButton({
            src: "images/ui/BeginPatrolButton.png",
            x: 1057,
            y: 600,
            width: 100,
            height: 50,
            frames: 2,
            gm: this.gm,
            tv: this.tv,
        });
        this.statusButton = new OpenStatusButton({
            src: "images/ui/StatusButton.png",
            x: 1150,
            y: 120,
            width: 100,
            height: 100,
            frames: 2,
            gm: this.gm,
            tv: this.tv,
        });
        this.deckGunButton = new DeckGunButton({
            src: "images/ui/DeckGunButton.png",
            x: 965,
            y: 580,
            width: 50,
            height: 50,
            frames: 5,
            gm: this.gm,
            tv: this.tv,
        });
        this.continueButton = new ContinuePatrolButton({
            src: "images/ui/ContinuePatrolButton.png",
            x: 1210,
            y: 590,
            width: 50,
            height: 120,
            frames: 2,
            gm: this.gm,
            tv: this.tv,
        });
        //Fire Weapons button
        this.fireButton = new FireAttackButton({
            src: "images/ui/FireButton.png",
            x: 1200,
            y: 580,
            width: 50,
            height: 50,
            frames: 4,
            gm: this.gm,
            tv: this.tv,
        });
        this.fireButton.changeState("Disabled");  //initial setting for fireButton is disabled

        //flood gauge
        var fgaugeSrc = "images/ui/FloodGauge" + this.gm.sub.flooding_hp + ".png";
        this.floodGauge = new MenuIcon({
            src: fgaugeSrc,
            x: 1055,
            y: 120,
            width: 100,
            height: 100,
            frames: this.gm.sub.flooding_hp,
            gm: this.gm,
            tv: this.tv,
            subItem: "this.gm.sub.flooding_Damage"
        })

        //damage gauge
        var dgaugeSrc = "images/ui/DamageGauge" + this.gm.sub.hull_hp + ".png";
        this.damageGauge = new MenuIcon({
            src: dgaugeSrc,
            x: 955,
            y: 120,
            width: 100,
            height: 100,
            frames: this.gm.sub.hull_hp,
            gm: this.gm,
            tv: this.tv,
            subItem: "this.gm.sub.hull_Damage"
        })

        //telegraph 
        var telegraphSrc = "images/ui/telegraph/Telegraph7_P_2T.png";  //incorrect starting src as default
        this.telegraph = new MenuIcon({
            src: telegraphSrc,
            x: 1014,
            y: 570,
            width: 200,
            height: 200,
            frames: this.gm.patrol.getPatrolLength(),
            gm: this.gm,
            tv: this.tv,
            subItem: "this.gm.currentBox"
        })
    }

    //passes events from UI to individual buttons
    handleEvent(){
        for (let i = 1; i < 7; i++) {
            this.tubeButtonArray[i].handleEvent(event);
        }
        this.reloadButton.handleEvent(event);
        if (!this.gm.patrolling && !this.tv.reloadMode) {
            this.beginPatrolButton.handleEvent(event);
        }
        this.statusButton.handleEvent(event);
        if (this.gm.patrolling && !this.tv.isInEncounter && !this.tv.statusMode && !this.tv.reloadMode) {
            this.continueButton.handleEvent(event);
        }
        if (this.tv.firingMode) {
            Object.values(this.tv.gameObjects).forEach(object => {
                object.sprite.handleEvent(event);
              })
            this.deckGunButton.handleEvent(event);
        }
        if (this.tv.firingMode && this.gm.sub.isFiring()) {
            this.fireButton.handleEvent(event);
        }
    }
    
    //checks if UI should be on or off
    uiIsOn(){
        if (!this.tv.scene.includes("Port") || this.tv.reloadMode == true){
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Forces torpedo button array to update()
     */
    forceTorpedoButtonUpdate() {
        for (let i = 1; i < 7; i++) {
            this.tubeButtonArray[i].getLatestState();
        }
    }

    //draws elemnts of UI
    draw(ctx){
        if (this.uiIsOn()){
            this.drawBgd(ctx);
            this.statusButton.draw(ctx);
            for (let i = 1; i < 7; i++) {
                this.tubeButtonArray[i].draw(ctx);
            }
            if (this.tv.reloadMode){
                this.reloadButton.draw(ctx);
            }
            this.drawHeaderTxt(ctx);

            //If Patrolling and not in reload mode
            if (!this.tv.reloadMode && this.gm.patrolling){
                this.telegraph.draw(ctx);
                this.deckGunButton.draw(ctx);
                if (!this.tv.isInEncounter && !this.tv.statusMode) {
                    this.continueButton.draw(ctx);
                }
                else {
                    this.fireButton.draw(ctx);
                }
            }

            //To start patrol
            if (!this.tv.reloadMode && !this.gm.patrolling){
                this.beginPatrolButton.draw(ctx);
            }
            this.floodGauge.draw(ctx);
            this.damageGauge.draw(ctx);
            let shipsInEnc = false;
            if (this.gm.currentEncounter != null) {
                let encounterType = this.gm.currentEncounter.encounterType;
                if (encounterType.includes("Ship") || encounterType.includes("Tanker") || encounterType.includes("Convoy")) {
                    shipsInEnc = true;
                }
            }
            if (this.tv.isInEncounter && shipsInEnc) {
                Object.values(this.tv.gameObjects).forEach(object => {
                    if (!object.sprite.isPlayer && object.sprite.shipType == "Escort") {
                        object.sprite.drawEscortShipInfo(ctx);
                    }
                    else if (!object.sprite.isPlayer) {
                        object.sprite.drawTargetShipInfo(ctx);
                    }
                  })
            }
            if (this.gm.sub.isFiring()) {
                if (this.fireButton.currentState != "Enabled" && this.fireButton.currentState != "Hover" && this.fireButton.currentState != "Active") {
                    this.fireButton.changeState("Enabled");
                }
                this.fireButton.draw(ctx);
            }
            else {
                if (this.fireButton.currentState != "Disabled") {
                    this.fireButton.changeState("Disabled");
                }
            }
        }
    }

    drawBgd(ctx){
        this.isLoaded && ctx.drawImage(
            this.uiBgd,
            0, 0
          )
    }

    drawHeaderTxt(ctx){
        //draws all text-based UI elements
        //Sub #
        ctx.font = "bold 30px courier";
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.fillText(this.gm.getFullUboatID(), 945, 40);

        //Rank and Name
        ctx.font = "italic 12px courier";
        ctx.fillStyle = "white";
        ctx.textAlign = "right";
        ctx.fillText(this.gm.getRankAndName(), 1260, 24);

        //date
        ctx.fillText(this.gm.getFullDate(), 1260, 40);

        //orders
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.font = "italic 12px courier";
        ctx.fillText("Orders: " + this.gm.currentOrdersLong, 1108, 85);

        //Torpedo totals
        ctx.textAlign = "center";
        ctx.fillStyle = "blue";
        ctx.font = "bold 16px Courier";
        //draw G7a (blue) text UI
        ctx.fillText(this.gm.sub.reloads_forward_G7a, 975, 258);
        ctx.fillText(this.gm.sub.reloads_aft_G7a, 975, 545);

        //draw G7e (red) text UI
        ctx.fillStyle = "darkred";
        ctx.fillText(this.gm.sub.reloads_forward_G7e, 1240, 258);
        ctx.fillText(this.gm.sub.reloads_aft_G7e, 1240, 545);

        const leftSide = 983;
        const rightSide = 1234;
        const topRow = 292
        const secondRow = 395;
        const bottomRow = 499;

        //draw tube text
        ctx.font = "bold 12px Courier";

        var sideArray = [];
        var rowArray = [];

        //determine x and y values for torpedo tube text, depending on 5 or 6 tubes
        if (this.gm.sub.getType() == "IXA" || this.gm.sub.getType() == "IXB"){
            sideArray = [0, 983, 1234, 983, 1234, 983, 1234];          //x values for torpedo tube text
            rowArray = [0, 292, 292, 395, 395, 499, 499];              //y values for torpedo tube text
        }
        else{
            sideArray = [0, 983, 1234, 983, 1234, 1033, 2000];         //x values for torpedo tube text
            rowArray = [0, 292, 292, 395, 395, 499, 2000];             //y values for torpedo tube text
        }
        const fillStyleArray = ["black", "blue", "darkred", "black"];        //color values for text
        const textArray = ["--", "G7a", "G7e", "MINES"]                      //text values

        //draw first 4 tubes
        for (let i = 1; i < 7; i++){
            ctx.fillStyle = fillStyleArray[this.gm.sub.tube[i]];
            ctx.fillText(textArray[this.gm.sub.tube[i]], sideArray[i], rowArray[i]);
        }
        
        //Bottom Right (either reloading flag or telegraph)
        if (this.tv.reloadMode == true){
            ctx.fillStyle = "darkred";
            ctx.font = "bold 30px Courier";
            ctx.fillText("LOADING TORPEDOES", 1108, 640);
        }

        //Ammo for Deck Gun
        if (!this.tv.reloadMode && this.gm.patrolling) {
            ctx.fillStyle = "black";
            ctx.font = "12px Courier"
            ctx.fillText(this.gm.sub.deck_gun_ammo, 990, 645);
        }
    }

    reloadMode(){
        this.tv.reloadMode = true;
    }
}