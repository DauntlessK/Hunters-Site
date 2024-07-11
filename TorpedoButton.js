class TorpedoButton extends Button{
    constructor(...args){
        super(...args);
        this.tubeState = "emptyAndReloading";    //can be empty, empty and reloading, and ready
        this.baseFrameEmpty = 4;
        this.baseFrameReady = 0;
        this.baseFrame = 4;
        this.currentFrame = this.baseFrame;
    }

    //Gets torpedo tube state based on the mode / what is allowable
    getLatestState(){

        //If in reload mode
        if (this.tv.reloadMode){
            this.baseFrame = 4;
            if (this.gm.sub.tube[this.tube] == 1){
                this.currentFrame = 6
            }
            else if (this.gm.sub.tube[this.tube] == 2){
                this.currentFrame = 7;
            }
        }
        //If in firing mode
        else if (this.tv.firingMode) {
            if (this.tv.currentTarget >= 0) {
                
            }
        }
        //Normal mode (not interactable)
        else {
            this.baseFrame = 0;
            //if current tube is not empty
            if (this.gm.sub.tube[this.tube] > 0){
                this.currentFrame = this.baseFrame;
            }
            //else if tube is empty
            else{
                this.currentFrame = 5;
            }
        }
    }

    clickedButton(){
        //If pressed when in reload mode
        if (this.tv.reloadMode) {
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
        //When pressed when in firing mode, and a target is selected
        else if (this.tv.firingMode && this.tv.currentTarget >= 0) {
            //If selected, deselect tube
            if (this.currentFrame == 2) {
                this.currentFrame = 0;

                //Check type in tube to assign to ship
                if (this.gm.sub[this.tube] == 1) {
                    this.gm.shipList[this.tv.getSelectedTarget()].unassignG7a();
                }
                else if (this.gm.sub[this.tube] == 2){
                    this.gm.shipList[this.tv.getSelectedTarget()].unassignG7e();
                }
                
                //Set tube to firing in Uboat object
                this.gm.sub.tubeFiring[this.tube] = false;
            }
            //Otherwise select tube
            else {
                this.currentFrame = 2;

                //Check type in tube to assign to ship
                if (this.gm.sub.tube[this.tube] == 1) {
                    console.log(this.gm.shipList[this.tv.getSelectedTarget()]);   //WHAT IS GOING ON??????
                    this.gm.shipList[this.tv.getSelectedTarget()].assignG7a();
                }
                else if (this.gm.sub.tube[this.tube] == 2){
                    this.gm.shipList[this.tv.getSelectedTarget()].assignG7e();
                }
                
                //Set tube to firing in Uboat object
                this.gm.sub.tubeFiring[this.tube] = true;
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