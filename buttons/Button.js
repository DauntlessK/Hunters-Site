/*
 * Abstract Button Class
*/

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

        this.tube = config.tube;

        //Boundaries
        this.xBoundMin = this.x;
        this.xBoundMax = this.xBoundMin + this.width;
        this.yBoundMin = this.y;
        this.yBoundMax = this.yBoundMin + this.height;

        //states
        this.frames = config.frames;   //default 0= active, 1=hover, 2=pressed, 3 disabled
        this.currentFrame = 0;
        this.currentStateOptions = ["Active", "Hover", "Pressed", "Disabled"];
        this.currentState = this.currentStateOptions[this.currentFrame];
    }

    handleEvent(event){
        const xPos = event.offsetX;
        const yPos = event.offsetY;

        //By default, does not change frame- clickable if not disabled
        if (event.type == "click" && this.withinBounds(xPos, yPos) && this.currenState != "Disabled"){
            this.click();
        }
        //For hover, if not disabled
        else if (event.type == "mousemove" && this.currenState != "Disabled")
            //If mouse moves over and button is active state
            if (this.withinBounds(xPos, yPos) && this.currentState == "Active") {
                this.changeState("Hover");
            }
            //Else if mouse moves outside and button is hover
            else if (!this.withinBounds(xPos, yPos) && this.currentState == "Hover"){
                this.changeState("Active");
            }  
    }

    //Pass in a given state (Active, Hover, etc) and changes the frame and state
    changeState(state) {
        switch (state) {
            case "Active":
            case "Enable":
            case "Enabled":
                this.currentFrame = 0;
                break;
            case "Hover":
                this.currentFrame = 1;
                break;
            case "Pressed":
            case "Press":
                this.currentFrame = 2;
                break;
            case "Disabled":
            case "Disable":
                this.currentFrame = 3;
                break;
        }

        this.currentState = this.currentStateOptions[this.currentFrame];
    }

    click() {
        //do something- must be overriden
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