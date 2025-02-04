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
            this.animationWakeFrameProgress -= 1;
            //Check to see if animiation frame progress is 0, roll to next frame
            if (this.animationFrameProgress === 0) {
                this.currentFrame += 1;

                //If at last frame
                if (this.currentFrame == this.lastFrame) {
                    this.currentFrame = this.startFrame;
                }

                //player diving animation
                if (this.diving) {
                    this.depth += 2;
                    if (this.depth >= 110) {
                        this.depth = 110;
                        this.diving = false;
                    }
                }

                //player surfacing animation
                if (this.surfacing) {
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
     * Gets a value to add to the sprite's Y-value. If it's at it, it gets a new one to move towards
     * @returns int of pixels to move up or down
     */
    randomUpAndDown() {
        //currently uses hard-coded 10 and neg 10 as the Y min and max
        if (this.depth == 0 && !this.tv.scene.includes("Port")) {
            return 0;
        }
        if (!this.tv.isPaused && (this.tv.scene.includes("Port") || this.depth > 109)) {
            if (this.currentTranslation === this.tv.getTotalTranslation()) {
                if (this.nextTranslationTimer != 0) {
                    this.nextTranslationTimer -= 1;
                    return this.currentTranslation;
                }
                else {
                    this.tv.setNewTranslation();
                }
            }
            else {
                if (this.translationProgress != 0) {
                    this.translationProgress -= 1;
                }
                else {
                    //reset translation progress
                    this.translationProgress = 40;   //hard-coded limit in between moves
                    if (this.currentTranslation > this.tv.getTotalTranslation()) {
                        this.currentTranslation -= 1;
                    }
                    else if (this.currentTranslation < this.tv.getTotalTranslation()) {
                        this.currentTranslation += 1;
                    }
                }
            }
        }
        return this.currentTranslation;
    }

    setDeparted() {
        this.departed = true;
    }
    
    depart() {
        if (this.departed && this.tv.scene == "Port") {
            this.departTranslation++;
            return this.departTranslation;
        }
        else {
            return 0;
        }
    }
    
    /**
     * Sets the sprite to start dive and fully draw sprite
     */
    dive() {
        this.tv.uboatwake.dive();
        this.diving = true;
        this.depth = 2;
        this.height = 150;
    }
    
    /**
     * Sets the sprite to begin surfacing back on normal X, depth 0
     */
    surface() {
        this.tv.uboatwake.surface();
        this.surfacing = true;
        this.depth = 108;
    }

    /**
     * Overrides sprite draw, adds additional drawing calls
     * @param {ctx} ctx 
     */
    draw(ctx) {
        //figure out x and y
        let x = this.x + this.depart(); 
        let y = this.y + this.randomUpAndDown() + this.depth;

        //work out width and height
        let swidth = this.width;
        let sheight = this.height;

        //increased size of sprite if its the player and at port
        if ((this.tv.scene == "Port" || this.tv.scene == "IntroPort")) {
            swidth = this.width + 150;
            sheight = this.height + 20;
        }

        this.isLoaded && ctx.drawImage(this.image,
            this.currentFrame * this.width, 0,
            this.width, this.height,
            x, y,
            swidth, sheight
        )
        
        this.updateAnimationProgress();
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