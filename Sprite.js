class Sprite{
    constructor(config) {

        //set up the image
        this.image = new Image();
        this.image.src = config.src;
        this.image.onload = () => {
            this.isLoaded = true;
        }

        //configure animation & initial state
        this.animations = configure.animations || {
            idle: [0]
        }
        this.currentAnimation = config.currentAnimation || idle;
        this.currentAnimationFrame = 0;

        //reference the game object
        this.gameObject = config.gameObject;

        draw(ctx) {
            const x = this.gameObject.x;
            const y = this.gameObject.y;

            this.isLoaded && ctx.drawImage(this.image,
                0,0,
                config.width,config.height,
                x,y,
                config.width,config.height
            )
        }
    }
}