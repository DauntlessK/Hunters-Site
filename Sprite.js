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
        idle: [0]
      }
      this.currentAnimation = config.currentAnimation || "idle";
      this.currentAnimationFrame = 0;
  
      //Reference the game object
      this.gameObject = config.gameObject;
    }
  
    draw(ctx) {
      const x = this.gameObject.x;
      const y = this.gameObject.y;
  
      this.isLoaded && ctx.drawImage(this.image,
        0,0,
        this.width,this.height,
        x,y,
        this.width,this.height
      )
    }
  }