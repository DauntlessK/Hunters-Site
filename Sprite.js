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
    this.diving = false;
    this.surfacing = false;
    this.surface();

    //for non-player ships
    this.shipNum = config.shipNum;
    this.shipList = config.shipList;
    this.shipType = null;
    var imageVariation = d6Roll();
    //get image variation for enemy ships
    if (this.shipNum >=0){
      this.shipType = this.shipList[this.shipNum].getType();
      this.shipType = this.shipType.replace(" ", "");

      //this.image.src = "images/ships/" + this.shipType + imageVariation + ".png";
      //console.log(this.image.src);
      this.image.src = "images/ships/SmallFreighter1.png";
    }

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

    //Boundaries
    this.xBoundMin = this.x;
    this.xBoundMax = this.xBoundMin + this.width;
    this.yBoundMin = this.y;
    this.yBoundMax = this.yBoundMin + this.height;
  }

  handleEvent(event){
    if (this.isPlayer || !this.tv.firingMode) {
      return;
    }
    const xPos = event.offsetX;
    const yPos = event.offsetY;
    if (event.type == "click" && this.currentFrame != 3){
        if (this.withinBounds(xPos, yPos)) {
            this[this.onClick]();
        }
    }
    else if (event.type == "mousemove" && this.currentFrame != 3)
        if (this.withinBounds(xPos, yPos) && this.currentFrame == 0){
            this.currentFrame = 1;
        }
        else if (!this.withinBounds(xPos, yPos) && this.currentFrame == 1){
            this.currentFrame = 0;
        }
  }

  withinBounds(xPos, yPos){
      //returns true if x and y pos are within the bounds of the width and height

      if (xPos > this.xBoundMin && xPos < this.xBoundMax &&
          yPos > this.yBoundMin && yPos < this.yBoundMax) {
          return true;
      }
      else {
          return false;
      }
  }

  //Checks current progress towards the next frame in animation
  updateAnimationProgress(){
    //Downtick frame progress if game is unpaused

    //non-player sprite
    /**if (this.tv.isUnpaused && !this.isPlayer){
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
    }*/

    //player sprite
    if (this.tv.isPaused == false && this.depth > 0 && this.isPlayer){
      this.animationFrameProgress -= 1;
      //Check to see if frame limit is 0, if it is, roll to next frame
      if (this.animationFrameProgress === 0 && this.currentAnimation === "cruise"){
          this.currentFrame += 1;
          if (this.currentFrame == this.frames -1){
              this.currentFrame = 1;
          }
          //player diving animation
          if (this.diving && this.isPlayer) {
            this.depth += 2;
            if (this.depth >= 110) {
              this.diving = false;
            }
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

  //Gets a value to add to the sprite's Y-value. If it's at it, it gets a new one to move towards
  randomUpAndDown(){
    //currently uses hard-coded 10 and neg 10 as the Y min and max
    if (!this.tv.isPaused && (this.tv.scene.includes("Port") || this.depth > 109)){
      if (this.currentTranslation === this.tv.getTotalTranslation() ){
        if (this.nextTranslationTimer != 0){
          this.nextTranslationTimer -= 1;
          return this.currentTranslation;
        }
        else{
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
    if (this.departed && this.tv.scene == "Port"){
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

  //sets the sprite to start dive and fully draw sprite
  dive(){
    this.diving = true;
    this.depth = 1;
    this.height = 150;
  }

  //puts the sprite back on normal X, depth 0
  surface(){
    //this.surfacing = true;
    this.depth = 0;
    this.height = 95;
  }

  setRange(range) {
    if (this.isPlayer) {
      return;
    }
    switch (range) {
      case "Short Range":
        this.currentFrame = 2;
        break;
      case "Medium Range":
        this.currentFrame = 1;
        break;
      case "Long Range":
        this.currentFrame = 0;
        break;
    } 
  }

  //Draw sprite
  draw(ctx) {

    var x = 0;
    var y = 0;

    //figure out x and y
    x = this.gameObject.x + this.depart();
    y = this.gameObject.y + this.randomUpAndDown() + this.depth;


    //work out width and height
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