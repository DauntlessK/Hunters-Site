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
    this.isSelected = false;
    var imageVariation = d6Roll();
    //get image variation for enemy ships
    if (this.shipNum >= 0) {
      this.shipType = this.shipList[this.shipNum].getType();
      this.shipType = this.shipType.replace(" ", "");

      //this.image.src = "images/ships/" + this.shipType + imageVariation + ".png";        //to set imagepath to shiptype

      //USED TO TEST ---- PRESET PNGs
      if (this.shipType == "Escort") {
        this.image.src = "images/ships/EscortShip1.png";
      }
      else {
        this.image.src = "images/ships/CargoShip1.png";
      }

      //need to also get a health bar image appropriate to the given ship
    }

    //Configure Animation & Initial State
    this.animations = config.animations || {
      "idle": 0,
      "cruise": 49
    }
    this.currentAnimation = "cruise";//config.currentAnimation || "idle";
    if (this.isPlayer) {
      this.currentFrame = 1;
    }
    else {
      this.currentFrame = 0;
    }

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
    this.xBoundMin = this.gameObject.x;
    this.xBoundMax = this.xBoundMin + this.width;
    this.yBoundMin = this.gameObject.y;
    this.yBoundMax = this.yBoundMin + this.height;
  }

  handleEvent(event) {
    if (this.isPlayer || !this.tv.firingMode) {
      return;
    }
    const xPos = event.offsetX;
    const yPos = event.offsetY;
    if (event.type == "click") {
      if (this.withinBounds(xPos, yPos) && this.shipType != "Escort") {
        //if currently selected, deselect
        if (this.isSelected && !this.isPlayer && this.shipType != "Escort") {
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

  withinBounds(xPos, yPos) {
    //returns true if x and y pos are within the bounds of the width and height

    if (xPos > this.xBoundMin && xPos < this.xBoundMax &&
      yPos > this.yBoundMin && yPos < this.yBoundMax) {
      return true;
    }
    else {
      return false;
    }
  }

  select() {
    if (this.isSelected || this.isPlayer || this.shipType == "Escort") {
      return;
    }
    else {
      this.currentFrame++;
      this.isSelected = true;
    }
  }

  //Checks current progress towards the next frame in animation
  updateAnimationProgress() {
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
    if (this.tv.isPaused == false && this.depth > 0 && this.isPlayer) {
      this.animationFrameProgress -= 1;
      //Check to see if frame limit is 0, if it is, roll to next frame
      if (this.animationFrameProgress === 0 && this.currentAnimation === "cruise") {
        this.currentFrame += 1;
        if (this.currentFrame == this.frames - 1) {
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
      else if (this.currentAnimation === "idle") {
        this.currentAnimationFrame = 0;
      }
    }
    else if (this.isPlayer) {
      this.currentFrame = 0;
    }
  }

  //Gets a value to add to the sprite's Y-value. If it's at it, it gets a new one to move towards
  randomUpAndDown() {
    //currently uses hard-coded 10 and neg 10 as the Y min and max
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

  updateTV(tv) {
    this.tv = tv;
  }

  //sets the sprite to start dive and fully draw sprite
  dive() {
    this.diving = true;
    this.depth = 1;
    this.height = 150;
  }

  //puts the sprite back on normal X, depth 0
  surface() {
    if (!this.isPlayer) {
      return;
    }
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
    if ((this.tv.scene == "Port" || this.tv.scene == "IntroPort")) {
      swidth = this.width + 150;
      sheight = this.height + 20;
    }
    else {
      swidth = this.width;
      sheight = this.height;
    }

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
    this.updateAnimationProgress();
  }

  //Draws ship name, type GRT, health bar, & torpedo indicators for cargo [targetable] ships
  drawTargetShipInfo(ctx) {
    //figure out x and y
    var x = this.gameObject.x + 101;
    var y = this.gameObject.y + 20;

    //Draw name, ship type and GRT
    ctx.font = "bold 12px courier";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(this.shipList[this.shipNum].getName(), x, y);

    var secondLine = this.shipList[this.shipNum].getType() + " - GRT: " + this.shipList[this.shipNum].getGRT();
    ctx.font = "9px courier";
    ctx.fillText(secondLine, x, y + 10);

    //Draw Torpedo Assignment Indicators
    ctx.font = "30px courier";
    var numOfG7a = this.shipList[this.shipNum].G7aINCOMING;
    var stringG7a = "";
    for (let i = 0; i < numOfG7a; i++) {
      stringG7a = stringG7a + "•"
    }

    //G7a
    ctx.fillStyle = "blue";
    ctx.textAlign = "left";
    ctx.fillText(stringG7a, this.gameObject.x + 10, y + 80);

    var numOfG7e = this.shipList[this.shipNum].G7eINCOMING;
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
    if (this.shipList[this.shipNum].deckGunINCOMING > 0) {
      ctx.fillText(this.shipList[this.shipNum].deckGunINCOMING, this.gameObject.x + 100, y + 74);
    }
  }

  //Draws ship name, type GRT, for escort ships
  drawEscortShipInfo(ctx) {
    //figure out x and y
    var x = this.gameObject.x - 50;
    var y = this.gameObject.y + 150;

    //Draw name, ship type and GRT
    ctx.font = "bold 12px courier";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(this.shipList[this.shipNum].getName(), x, y);

    var secondLine = this.shipList[this.shipNum].clss + " - GRT: " + this.shipList[this.shipNum].getGRT();
    ctx.font = "9px courier";
    ctx.fillText(secondLine, x, y + 10);
  }
}