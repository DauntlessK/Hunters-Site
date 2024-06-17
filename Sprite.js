class Sprite {
  constructor(config) {

    this.tv = null;
    
    //Set up the image
    this.image = new Image();
    this.image.src = config.src;
    this.image.onload = () => {
      this.isLoaded = true;
    }
    this.width = config.width;
    this.height = config.height;
    this.frames = config.frames;
    this.isPlayer = config.isPlayer;

    this.depth = 0;
    this.surface();

    //Configure Animation & Initial State
    this.animations = config.animations || {
      "idle": 0,
      "cruise": 49
    }
    this.currentAnimation = "cruise";//config.currentAnimation || "idle";
    this.currentFrame = 1;

    this.animationFrameLimit = 8;
    this.animationFrameProgress = 8;

    this.departed = false;
    this.departTranslation = 0;

    //maximum variance of up/down animation float
    this.currentTranslation = 0;
    this.totalTranslation = 0;
    this.translationProgress = 20;
    this.nextTranslationTimer = 0;

    //Reference the game object
    this.gameObject = config.gameObject;
  }

  updateAnimationProgress(){
    //Downtick frame progress if game is unpaused

    //non-player sprite
    if (this.tv.isUnpaused && !this.isPlayer){
      this.animationFrameProgress -= 1;
      if (this.animationFrameProgress === 0){
        this.currentFrame++;
        if (this.currentFrame == this.frames - 1){
          this.currentFrame = 1;
        }
        this.animationFrameProgress = this.animationFrameLimit;
      }
    }
    else if (!this.isPlayer) {
      this.currentFrame = 0;
    }

    //player sprite
    if (this.tv.isUnpaused == true && this.depth > 0 && this.isPlayer){
      this.animationFrameProgress -= 1;
      //Check to see if frame limit is 0, if it is, roll to next frame
      if (this.animationFrameProgress === 0 && this.currentAnimation === "cruise"){
          this.currentFrame += 1;
          if (this.currentFrame == this.frames -1){
              this.currentFrame = 1;
          }
          this.animationFrameProgress = this.animationFrameLimit;
      }
      else if (this.currentAnimation === "idle"){
        this.currentAnimationFrame = 0;
      }
    }
    else if (this.isPlayer) {
      this.currentFrame = 0;
    }
  }

  randomUpAndDown(){
    //currently uses hard-coded 10 and neg 10 as the Y min and max
    if (this.tv.isUnpaused == true){
      if (this.currentTranslation === this.tv.getTotalTranslation() ){
        if (this.nextTranslationTimer != 0){
          this.nextTranslationTimer -= 1;
          return this.currentTranslation;
        }
        else{
          //this.nextTranslationTimer = Math.floor(Math.random() * (250 - 100)) + 100;
          //this.totalTranslation = Math.floor(Math.random() * (10 - -10)) + -10;
          this.tv.setNewTranslation();
        }
      }
      else{
          if (this.translationProgress != 0) {
              this.translationProgress -= 1;
          }
          else{
              //reset translation progress
              this.translationProgress = 40;   //hard-coded limit in between moves
              if (this.currentTranslation > this.tv.getTotalTranslation()){
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

  setDeparted(){
    this.departed = true;
  }

  depart(){
    if (this.departed){
      this.departTranslation++;
      return this.departTranslation;
    }
    else{
      return 0;
    }
  }

  updateTV(tv){
    this.tv = tv;
  }

  dive(){
    this.depth = 85;
    this.height = 150;
  }

  surface(){
    this.depth = 0;
  }

  //Draw sprite
  draw(ctx) {

    var x = 0;
    var y = 0;

    //figure out x and y
    x = this.gameObject.x + this.depart();
    y = this.gameObject.y + this.randomUpAndDown() + this.depth;

    var swidth = 0;
    var sheight = 0;

    //increased size of sprite if its the player and at port
    if ((this.tv.scene == "Port" || this.tv.scene == "IntroPort")){
      swidth = this.width + 150;
      sheight = this.height + 20;
    }
    else{
      swidth = this.width;
      sheight = this.height;
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