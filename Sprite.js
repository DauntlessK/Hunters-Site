class Sprite {
    constructor(config) {
  
      this.tv = config.tv;
      this.gm = config.gm;
  
      //Set up the image
      this.image = new Image();
      this.image.src = config.src;
      this.image.onload = () => {
        this.isLoaded = true;
      }
      this.width = config.width;            //Width of sprite image
      this.height = config.height;          //Height of sprite image
      this.frames = config.frames;          //Total # of frames
      this.x = config.x;
      this.y = config.y;
  
      this.animationFrameLimit = 8;
      this.animationFrameProgress = 8;
      this.startFrame = 0;
      this.lastFrame = this.frames - 1;
      this.currentFrame = this.startFrame;
  
      //Boundaries
      this.xBoundMin = config.x;
      this.xBoundMax = this.xBoundMin + this.width;
      this.yBoundMin = config.y;
      this.yBoundMax = this.yBoundMin + this.height;
    }

    /**
     * To be overridden by child
     * @param {event} event 
     */
    handleEvent(event) {
        console.log("Handle event");
    }

    /**
     * Called to see if mouse cursor is within the x and y bounds of the sprite
     * @param {int} xPos 
     * @param {int} yPos 
     * @returns True if x and y pos are within the bounds of the width and height
     */
    withinBounds(xPos, yPos) {    
        if (xPos > this.xBoundMin && xPos < this.xBoundMax &&
            yPos > this.yBoundMin && yPos < this.yBoundMax) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
    * Updates sprite with new sprite image
    * @param {string} new sprite path and extension
    */
    updateSprite(newName) {
        this.image.src = newName;
    }

    /**
     * Changes the number of frames the sprite animation has, while also updating the last frame int and resetting the currentFrame to zero.
     * @param {int} numFrames 
     */
    setNewFrameCount(numFrames) {
      this.frames = numFrames;
      this.lastFrame = this.frames - 1;
      this.currentFrame = 0;
    }

    /**
     * Updates the animation frame limit, making it faster (with a lower number) or slower (with a higher number)
     * @param {int} numLimit 
     */
    setNewFrameLimit(numLimit) {
      this.animationFrameLimit = numLimit;
      this.animationFrameProgress = this.animationFrameLimit;
    }

    /**
    * Keeps track of when the current animation frame should be moved to the next animation frame
    */
    updateAnimationProgress() {
        if (!this.tv.isPaused) {
            this.animationFrameProgress -= 1;

            //If animation progress is at zero, it's time to flip to next frame
            if (this.animationFrameProgress === 0) {
                this.currentFrame += 1;

                //If at last frame
                if (this.currentFrame == this.lastFrame) {
                    this.currentFrame = this.startFrame;
                }

                //Reset animation progress tracker to the frame limit
                this.animationFrameProgress = this.animationFrameLimit;
            }
        }
    }

    updateTV(tv) {
        this.tv = tv;
    }

    /**
    * Responsible for drawing the sprite on the canvas.
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
        
        if (this.frames != 1) {
            this.updateAnimationProgress();
        }
    }
}