class SpriteWake extends Sprite{
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

  dive() {
    console.log("Diving");
    this.diving = true;
    this.image.src = "images/water/UboatWakeDiving_spritesheet.png";
    this.currentFrame = this.startFrame;
    this.frames = 30;
    this.lastFrame = this.frames - 1;
  }

  diveComplete() {
    console.log("Dive Complete");
    this.diving = false;
    this.image.src = "images/blank.png";  //TODO need wave only animation
    //this.frames = 24;
    //this.startFrame = 0;
    //this.currentFrame = this.startFrame;
    //this.lastFrame = this.frames - 1;
  }

  surface() {
    console.log("Surfacing");
    this.surfacing = true;
    this.image.src = "images/water/UboatWakeDiving_spritesheet.png";
    this.frames = 30;
    this.startFrame = this.frames - 1;
    this.currentFrame = this.frames - 1;
    this.lastFrame = 0;
  }

  surfaceComplete() {
    console.log("Surface Complete");
    this.surfacing = false;
    this.image.src = "images/water/UboatWake_spritesheet.png";
    this.frames = 24;
    this.startFrame = 0;
    this.currentFrame = this.startFrame;
    this.lastFrame = this.frames - 1;
  }


  /**
   * Updates sprite with new sprite based on string given
   * @param {string} new sprite name 
   */
  updateSprite(newName) {
      this.image.src = newName;
  }

  //Checks current progress towards the next frame in animation
  updateAnimationProgress() {
    //Downtick frame progress if game is unpaused
    if (!this.tv.isPaused) {
      //console.log(this.animationFrameProgress + " | " + this.currentFrame);  //DEBUG FRAME AND FRAME PROGRESS
      this.animationFrameProgress -= 1;
      //Check to see if animiation frame progress is 0, roll to next frame
      if (this.animationFrameProgress === 0) {
        if (this.surfacing) {
          this.currentFrame -= 1;     //plays animation backwards
        }
        else {
          this.currentFrame += 1;
        }

        //If at last frame
        if (this.currentFrame == this.lastFrame) {
          if (this.diving) {
            this.diveComplete();
          }
          else if (this.surfacing) {
            this.surfaceComplete();
          }
          this.currentFrame = this.startFrame;
        }

        this.animationFrameProgress = this.animationFrameLimit;
      }
    }
  }

  //Gets a value to add to the sprite's Y-value. If it's at it, it gets a new one to move towards
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

  //Draw sprite
  draw(ctx) {

    var x = 0;
    var y = 0;

    //figure out x and y
    x = this.x + this.depart(); 
    y = this.y + this.randomUpAndDown() + this.depth;   
    
    //console.log("X: " + x + " | Y: " + y);


    //work out width and height
    var swidth = 0;
    var sheight = 0;

    //increased size of sprite if its the player and at port
    if ((this.tv.scene == "Port" || this.tv.scene == "IntroPort")) {
      swidth = this.width + 150;
      sheight = this.height + 20;
    }
    else {
      swidth = this.width * 1.1;
      sheight = this.height * 1.55;
      y = y - 20;
      x = x - 30;
    }

    this.isLoaded && ctx.drawImage(this.image,
      this.currentFrame * this.width, 0,
      this.width, this.height,
      x, y,
      swidth, sheight
    )
    
    this.updateAnimationProgress();
  }
}