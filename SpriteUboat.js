/**
 * For Player U-Boat
 */
class SpriteUboat extends Sprite {
    constructor(config) {
        super(config);

        this.depth = 0;
        this.diving = false;
        this.surfacing = false;

        this.departed = false;
        this.departTranslation = 0;
    
        //maximum variance of up/down animation float
        this.currentTranslation = 0;
        this.totalTranslation = 0;
        this.translationProgress = 20;
        this.nextTranslationTimer = 0;
    }

    /**
    * Keeps track of when the current animation frame should be moved to the next animation frame
    */
    updateAnimationProgress() {
        //Downtick frame progress if game is unpaused
        if (!this.tv.isPaused && this.depth > 0) {
            this.animationFrameProgress -= 1;
            //Check to see if animiation frame progress is 0, roll to next frame
            if (this.animationFrameProgress === 0) {
                this.currentFrame += 1;

                //If at last frame
                if (this.currentFrame == this.lastFrame) {
                    this.currentFrame = this.startFrame;
                }

                //player diving animation
                if (this.diving && this.isPlayer) {
                    this.depth += 2;
                    if (this.depth >= 110) {
                        this.depth = 110;
                        this.diving = false;
                    }
                }

                //player surfacing animation
                if (this.surfacing && this.isPlayer) {
                    this.depth -= 2;
                    if (this.depth <= 0) {
                        this.surfacing = false;
                        this.depth = 0;
                        this.height = 95;
                    }
                }

                this.animationFrameProgress = this.animationFrameLimit;
            }
        }

        //Deal with wake frames UNSURE IF NEEDED / WILL REPURPOSE FOR UBOAT WAKE WAVES
        if (this.tv.isPaused == false && !this.isPlayer && !this.isAircraft) {
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

    /**
    * Overrides sprite draw, adds additional drawing calls
    * @param {ctx} ctx 
    */
    draw(ctx) {
        //figure out x and y
        let x = this.x; 
        let y = this.y;

        //work out width and height
        swidth = this.width;
        sheight = this.height;

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
            his.drawWake(ctx);
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
        ctx.font = "30px courier";
        var numOfG7a = this.encounter.shipList[this.shipNum].G7aINCOMING;
        var stringG7a = "";
        for (let i = 0; i < numOfG7a; i++) {
            stringG7a = stringG7a + "•"
        }

        //G7a
        ctx.fillStyle = "blue";
        ctx.textAlign = "left";
        ctx.fillText(stringG7a, this.gameObject.x + 10, y + 80);

        var numOfG7e = this.encounter.shipList[this.shipNum].G7eINCOMING;
        var stringG7e = "";
        for (let i = 0; i < numOfG7e; i++) {
            stringG7e = stringG7e + "•"
        }

        //G7e
        ctx.fillStyle = "darkred";
        ctx.textAlign = "right";
        ctx.fillText(stringG7e, this.gameObject.x + 190, y + 80);

        //Draw Deck Gun Assignment Indicator
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.font = "bold 10px courier";
        //Only draw if there is 1 or more shots incoming
        if (this.encounter.shipList[this.shipNum].deckGunINCOMING > 0) {
            ctx.fillText(this.encounter.shipList[this.shipNum].deckGunINCOMING, this.gameObject.x + 100, y + 74);
        }
    }

    /**
     * Draws ship name, type GRT, for escort ships
     * @param {ctx} ctx 
     */
    drawEscortShipInfo(ctx) {
        //figure out x and y
        let x = this.gameObject.x - 50;
        let y = this.gameObject.y + 150;

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