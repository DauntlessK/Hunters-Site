class Button {
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

        this.onClick = config.onClick;

        this.tube = config.tube || null;

        //Boundaries
        this.xBoundMin = this.x;
        this.xBoundMax = this.xBoundMin + this.width;
        this.yBoundMin = this.y;
        this.yBoundMax = this.yBoundMin + this.height;

        //states
        this.frames = config.frames;   //default 0= active, 1=pressed, 2=pressed, 3 disabled
        this.currentFrame = 0; //default state is 0/active
    }

    handleEvent(event){
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

    //called when finished with the reload mode
    commitReload(){

        this.tv.reloadMode = false;

        if (!this.tv.isDeparted) {
            this.gm.newPatrol();
            this.tv.gameObjects.uboat.sprite.setDeparted();
            this.tv.gameObjects.waterline.sprite.setDeparted();
            this.tv.setDeparted(true);
        }

        this.disableButton();
    }

    openStatus(){
        this.gm.eventResolved = false;
        const popup = new StatusPopup(this.tv, this.gm);
    }

    beginPatrol(){
        //for begin patrol button to start patrol loop
        this.gm.beginPatrol();
        this.disableButton();
    }

    continuePatrol(){
        this.gm.advancePatrol();
    }

    disableButton(){
        this.currentFrame = 3;
    }

    enableButton(){
        this.currentFrame = 0;
    }

    //Draw Button
    draw(ctx) {
        this.isLoaded && ctx.drawImage(
            this.image,
            this.currentFrame * this.width, 0,
            this.width, this.height,
            this.x, this.y,
            this.width, this.height
        )
    }
}