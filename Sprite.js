class Sprite {
  constructor(config) {

    //Set up the image
    this.image = new Image();
    this.image.src = config.src;
    this.image.onload = () => {
      this.isLoaded = true;
    }
    this.width = config.width;
    this.height = config.height;


    //Configure Animation & Initial State
    this.animations = config.animations || {
      "idle": 0,
      "cruise": 49
    }
    this.currentAnimation = "cruise";//config.currentAnimation || "idle";
    this.currentAnimationFrame = 0;

    this.animationFrameLimit = config.animationFrameLimit || 16;
    this.animationFrameProgress = this.animiationFrameLimit;

    //Reference the game object
    this.gameObject = config.gameObject;
  }

  get frame() {
    return 0;
  }

  updateAnimationProgress(){
    //Downtick frame progress
    if (this.animationFrameProgress > 0){
      this.animationFrameProgress -= 1;
      return;
    }

    //Reset Counter
    this.animationFrameProgress = this.animationFrameLimit;
    this.currentAnimationFrame += 1;

    if (this.frame === undefined) {
      this.currentAnimationFrame = 0;
    }
  }

  //Draw sprite
  draw(ctx) {
    const x = this.gameObject.x;
    const y = this.gameObject.y;

    //const [frameX] = this.frame;
    //console.log(1);
    //console.log("wow")

    this.isLoaded && ctx.drawImage(this.image,
      this.frame * this.width, 0,
      this.width, this.height,
      x, y,
      this.width, this.height
    )
    this.updateAnimationProgress();
  }
}