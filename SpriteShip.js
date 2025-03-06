/**
 * For Non-player Ships (Escorts, freighters, tankers, and capital ships)
 */
class SpriteShip extends Sprite {
    constructor(config) {
        super(config);

        //for non-player ships
        this.shipNum = config.shipNum;
        this.encounter = config.encounter;
        this.shipType = null;
        this.isSelected = false;
        
        this.cargoWakeImage = new Image();
        this.cargoWakeImage.src = "images/ships/CargoWakes.png";
        this.escortWakeImage = new Image();
        this.escortWakeImage.src = "images/ships/EscortWakes.png";
        
        this.currentWakeFrame = 0;

        this.shipType = this.encounter.shipList[this.shipNum].getType();
        this.shipType = this.shipType.replace(" ", "");

        //TODO Ship image variation
        var imageVariation = d6Roll();

        //USED TO TEST ---- PRESET PNGs
        if (this.shipType == "Escort") {
            this.image.src = "images/ships/EscortShip1.png";
        }
        else if (this.shipType == "CapitalShip") {
            this.image.src = "images/ships/CapitalShip1.png";
        }
        else {
            this.image.src = "images/ships/CargoShip" + imageVariation.toString() + ".png";        //to set imagepath to shiptype
            //this.image.src = "images/ships/CargoShip1.png";
        }

        //Get Health Bar Image
        if (this.shipType != "Escort") {
            this.healthBarImage = new Image();
            this.healthisLoaded = false;
            this.healthBarImage.onload = () => {this.healthisLoaded = true;}
            this.shipHP = this.encounter.shipList[this.shipNum].hp.toString();
            this.healthBarImage.src = "images/ui/shiphealthbars/ShipHealthBar_" + this.shipHP + ".png";
        }
    }

    /**
    * Keeps track of when the current animation frame should be moved to the next animation frame
    */
    updateAnimationProgress() {
        //Downtick frame progress if game is unpaused
        if (!this.tv.isPaused) {
            this.animationFrameProgress -= 1;
            //Check to see if animiation frame progress is 0, roll to next frame
            if (this.animationFrameProgress === 0) {
                this.currentFrame += 1;
                this.currentWakeFrame += 1;

                //If at last frame
                if (this.currentFrame == this.lastFrame) {
                    this.currentFrame = this.startFrame;
                }

                //Only two wake frames, so reset to 0 if beyond 1
                //TODO SPECIAL NOTE: WAKES NEED TO BE EXTENDED SO THEY ANIMATE SLOWLY (MORE SAME FRAMES PER PROGRESS)
                //OR MAY BE EASIER TO SIMPLY MAKE TWO ANIMATIONFRAMEPROGRESS COUNTERS, ONE SPECIAL ONE FOR WAKE
                if (this.currentWakeFrame > 1) {
                    this.currentWakeFrame = 0;
                }

                this.animationFrameProgress = this.animationFrameLimit;
            }
        }

        //Deal with wake frames
        if (!this.tv.isPaused) {
            this.animationFrameProgress -= 1;
            if (this.animationFrameProgress === 0) {
                this.currentWakeFrame += 1;
                
                if (this.currentWakeFrame > 1) {
                    this.currentWakeFrame = 0;
                }
                    this.animationFrameProgress = this.animationFrameLimit * 4;
            }
        }
    }

    handleEvent(event) {
        const xPos = event.offsetX;
        const yPos = event.offsetY;
        if (event.type == "click") {
            if (this.withinBounds(xPos, yPos) && this.encounter.shipList[this.shipNum].getType() != "Escort") {
                //if currently selected, deselect
                if (this.isSelected && !this.isPlayer && this.encounter.shipList[this.shipNum].getType() != "Escort") {
                //this.currentFrame--;
                this.tv.selectTarget(-1);
                }
                //else if it is not the selected target, select it
                else {
                //this.currentFrame++;
                this.tv.selectTarget(this.shipNum);
                }
            }
        }
        else if (event.type == "mousemove")
          if (this.withinBounds(xPos, yPos)) {
            //console.log("Hover");
          }
          else if (!this.withinBounds(xPos, yPos)) {
            //console.log("Not hover");
        }
    }

    select() {
        if (this.isSelected || this.encounter.shipList[this.shipNum].getType() == "Escort") {
            return;
        }
        else {
            this.currentFrame++;
            this.isSelected = true;
        }
    }

    /**
    * Sets the frame for enemy ships for short medium or long range
    * @param {string} range 
    */
    setRange(range) {
        switch (range) {
            case "Short Range":
                this.currentFrame = 4;
                break;
            case "Medium Range":
                this.currentFrame = 2;
                break;
            case "Long Range":
                this.currentFrame = 0;
                break;
        }
    }

    /**
    * Overrides sprite draw, adds additional drawing calls
    * @param {ctx} ctx 
    */
    draw(ctx) {
        //figure out x and y
        let x = this.x; 
        let y = this.y;

        //work out width and height
        let swidth = this.width;
        let sheight = this.height;

        this.isLoaded && ctx.drawImage(this.image,
            this.currentFrame * this.width, 0,
            this.width, this.height,
            x, y,
            swidth, sheight
        )

        //Update selections to get correct frame
        if (this.tv.getSelectedTarget() == this.shipNum) {
            this.select();
        }
        else {
            if (this.isSelected) {
                this.isSelected = false;
                this.currentFrame--;
            }
        }

        //Draw Health bar if not escort
        if (this.encounter != null) {
            if (this.encounter.shipList[this.shipNum].getType() != "Escort") {
                this.drawHealthBar(ctx);
            }
            this.drawWake(ctx);
        }
        
        this.updateAnimationProgress();
    }

    /**
     * Draws ship name, type GRT, health bar, & torpedo indicators for cargo [targetable] ships
     * @param {ctx} ctx 
     */
    drawTargetShipInfo(ctx) {
        //figure out x and y
        let x = this.x + 101;
        let y = this.y + 20;

        //Draw name, ship type and GRT
        ctx.font = "bold 12px courier";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(this.encounter.shipList[this.shipNum].getName(), x, y);

        var secondLine = this.encounter.shipList[this.shipNum].getType() + " - GRT: " + this.encounter.shipList[this.shipNum].getGRT();
        ctx.font = "9px courier";
        ctx.fillText(secondLine, x, y + 10);

        //Draw Torpedo Assignment Indicators
        ctx.font = "50px Arial";
        var numOfG7a = this.encounter.shipList[this.shipNum].G7aINCOMING;
        var stringG7a = "";
        for (let i = 0; i < numOfG7a; i++) {
            stringG7a = stringG7a + "."
        }

        //G7a
        ctx.fillStyle = "blue";
        ctx.textAlign = "left";
        ctx.fillText(stringG7a, this.x + 10, y + 74);

        var numOfG7e = this.encounter.shipList[this.shipNum].G7eINCOMING;
        var stringG7e = "";
        for (let i = 0; i < numOfG7e; i++) {
            stringG7e = stringG7e + "."
        }

        //G7e
        ctx.fillStyle = "darkred";
        ctx.textAlign = "right";
        ctx.fillText(stringG7e, this.x + 190, y + 74);

        //Draw Deck Gun Assignment Indicator
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.font = "bold 10px courier";
        //Only draw if there is 1 or more shots incoming
        if (this.encounter.shipList[this.shipNum].deckGunINCOMING > 0) {
            ctx.fillText(this.encounter.shipList[this.shipNum].deckGunINCOMING, this.x + 100, y + 74);
        }
    }

    /**
     * Draws ship name, type GRT, for escort ships
     * @param {ctx} ctx 
     */
    drawEscortShipInfo(ctx) {
        //figure out x and y
        let x = this.x - 50;
        let y = this.y + 150;

        //Draw name, ship type and GRT
        ctx.font = "bold 12px courier";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(this.encounter.shipList[this.shipNum].getName(), x, y);

        var secondLine = this.encounter.shipList[this.shipNum].clss + " - GRT: " + this.encounter.shipList[this.shipNum].getGRT();
        ctx.font = "9px courier";
        ctx.fillText(secondLine, x, y + 10);
    }

    /**
     * Responsible for drawing the health bar and correct frame based on HP
     * @param {ctx} ctx 
     */
    drawHealthBar(ctx) {
        //figure out x and y
        let x = this.x + 30;
        let y = this.y + 50;

        //Get current damage of ship
        var dam = this.encounter.shipList[this.shipNum].damage;
        if (dam > this.encounter.shipList[this.shipNum].hp) {
            dam = this.encounter.shipList[this.shipNum].hp;
        }

        //Doublecheck if HP is different than current HP bar
        if (this.encounter.shipList[this.shipNum].hp != this.shipHP) {
            this.shipHP = this.encounter.shipList[this.shipNum].hp.toString();
            this.healthBarImage.src = "images/ui/shiphealthbars/ShipHealthBar_" + this.shipHP + ".png";
        }

        this.healthisLoaded && ctx.drawImage(this.healthBarImage,
            dam * 140, 0,
            140, 35,
            x, y,
            140, 35
        )
    }

    drawWake(ctx) {
        //figure out x and y
        let x = this.x - 100;
        let y = this.y;
    
        let frame = this.currentFrame;
        if (frame % 2 == 1) {
            frame -= 1;
        }
    
        frame = frame + this.currentWakeFrame;
        let imageToUse;
    
        if (this.shipType == "Escort") {
            imageToUse = this.escortWakeImage;
        }
        else {
            imageToUse = this.cargoWakeImage;
        }
    
        ctx.drawImage(imageToUse,
            frame * 301, 0,
            301, 165,
            x, y,
            301, 165
        )
    }
}