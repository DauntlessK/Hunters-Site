class MenuIcon {
    constructor(config){
        this.gm = config.gm;
        this.tv = config.tv;

        //Set up the image
        this.image = new Image();
        this.image.src = config.src;
        this.image.onload = () => {
            this.isLoaded = true;
        }
        this.width = config.width;
        this.height = config.height;
        this.x = config.x;   //location drawn x
        this.y = config.y;   //location drawn y

        //states
        this.frames = config.frames;
        this.currentFrame = 0;

        //sub item that the icon monitors
        this.subItem = config.subItem;
    }

    update(){
        this.currentFrame = eval(this.subItem);
    }

    setSrc(src) {
        this.image.src = src;
    }

    advanceFrame(){
        this.currentFrame++;
        if (this.currentFrame > this.frames){
            this.currentFrame = 0;
        }
    }

    //Draw Icon
    draw(ctx) {
        this.isLoaded && ctx.drawImage(
            this.image,
            this.currentFrame * this.width, 0,
            this.width, this.height,
            this.x, this.y,
            this.width, this.height
        )
        this.update();
    }
}