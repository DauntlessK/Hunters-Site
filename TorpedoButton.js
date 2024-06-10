class TorpedoButton extends Button{
    constructor(...args){
        super(...args);
    }

    getLatestState(){
        //figure out how many G7a or G7e are loaded forward. First go for G7a
        switch (this.tube){
            case 1:
                break;
            case 2:
                break;
        }
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
        //this.getLatestState()
    }
}