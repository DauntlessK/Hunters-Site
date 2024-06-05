class Button {
    constructor(config){
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
        if (event.type == "click"){
            if (this.withinBounds(xPos, yPos)) {
                this.clickedButton();
            }
        }
        else if (event.type == "mousemove")
            if (this.withinBounds(xPos, yPos) && this.currentFrame == 0){
                this.currentFrame = 1;
            }
            else if (!this.withinBounds(xPos, yPos) && this.currentFrame == 1){
                this.currentFrame = 0;
            }
        
    }

    withinBounds(xPos, yPos){
        if (xPos > this.xBoundMin && xPos < this.xBoundMax &&
            yPos > this.yBoundMin && yPos < this.yBoundMax) {
            return true;
        }
        else {
            return false;
        }
    }

    clickedButton(){
        console.log("Clicked button!----");
        if (this.currentFrame == 0 || this.currentFrame == 1) {
            this.currentFrame = 2;
        }
        else if (this.currentFrame == 2){
            this.currentFrame = 0;
        }

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