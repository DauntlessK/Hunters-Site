class TorpedoButton extends Button{
    constructor(...args){
        super(...args);
        this.tubeState = "emptyAndReloading";    //can be empty, empty and reloading, and ready
        this.baseFrameEmpty = 4;
        this.baseFrameReady = 0;
        this.baseFrame = 4;
        this.currentFrame = this.baseFrame;
    }

    getLatestState(){
        //figure out how many G7a or G7e are loaded forward. First go for G7a

        if (this.tv.reloadMode){
            this.baseFrame = 4;
            if (this.gm.sub.tube[this.tube] == 1){
                this.currentFrame = 6
            }
            else if (this.gm.sub.tube[this.tube] == 2){
                this.currentFrame = 7;
            }
        }
        else {
            this.baseFrame = 0;
                if (this.gm.sub.tube[this.tube] > 0){
                    this.currentFrame = this.baseFrame;
                }
                else{
                    this.currentFrame = 5;
                }
        }
    }

    clickedButton(){
        if (this.tv.reloadMode) {
            if (this.tv.reloadMode == true){
                if (this.gm.sub.tube[this.tube] == 0){
                    if (this.tube <= 4 && this.gm.sub.reloads_forward_G7a > 0){
                        this.gm.sub.loadTube(this.tube, 1);
                    }
                    else if (this.tube <=4 && this.gm.sub.reloads_forward_G7e > 0){
                        this.gm.sub.loadTube(this.tube, 2);
                    }
                    else if (this.tube > 4 && this.gm.sub.reloads_aft_G7a > 0){
                        this.gm.sub.loadTube(this.tube, 1);
                    }
                    else if (this.tube > 4 && this.gm.sub.reloads_aft_G7e > 0){
                        this.gm.sub.loadTube(this.tube, 2);
                    }
                }
                else if (this.gm.sub.tube[this.tube] == 1){
                    this.gm.sub.loadTube(this.tube, 2);
                }
                else if (this.gm.sub.tube[this.tube] == 2){
                    this.gm.sub.loadTube(this.tube, 1);
                }
            }
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
        else if (event.type == "mousemove"){
            if (this.withinBounds(xPos, yPos) && this.currentFrame == this.baseFrame){
                this.currentFrame = this.baseFrame + 1;
            }
            else if (!this.withinBounds(xPos, yPos) && this.currentFrame == this.baseFrame + 1){
                this.currentFrame = this.baseFrame;
            }
        }
        this.getLatestState()
    }
}