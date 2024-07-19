class TorpedoButton extends Button{
    constructor(...args){
        super(...args);
        this.tubeState = "emptyAndReloading";    //can be empty, empty and reloading, and ready

        this.currentStateOptions = ["Enabled", "Hover", "Pressed", "Disabled", "Empty", "Empty Hover", "G7a", "G7e"];
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
            case "Empty":
                this.currentFrame = 4;
                break;
            case "Empty Hover":
                this.currentFrame = 5;
                break;
            case "G7a":
                this.currentFrame = 6;
                break;
            case "G7e":
                this.currentFrame = 7;
                break;
        }

        this.currentState = this.currentStateOptions[this.currentFrame];
    }

    //Gets torpedo tube state based on the mode / what is allowable
    getLatestState(){
        //If in reload mode
        if (this.tv.reloadMode){
            if (this.gm.sub.tube[this.tube] == 1){
                this.changeState("G7a");
            }
            else if (this.gm.sub.tube[this.tube] == 2){
                this.changeState("G7e");
            }
        }
        //If in firing mode
        else if (this.tv.firingMode) {
            if (this.tv.currentTarget >= 0) {
                //TODO NEED TO DEAL WITH BROKEN TORPEDO DOORS
            }
        }
        //Normal mode (not interactable)
        else {
            //if current tube is not empty
            if (this.gm.sub.tube[this.tube] > 0){
                this.changeState("Active");
            }
            //else if tube is empty
            else{
                this.changeState("Empty");
            }
        }
    }

    click(){
        //If pressed when in reload mode
        if (this.tv.reloadMode) {
            //If tube is empty
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
            //If tube contains G7a
            else if (this.gm.sub.tube[this.tube] == 1){
                this.gm.sub.loadTube(this.tube, 2);
            }
            //If tube contains G73
            else if (this.gm.sub.tube[this.tube] == 2){
                this.gm.sub.loadTube(this.tube, 1);
            }
        }
        //When pressed when in firing mode, and a target is selected, AND not firing deck gun
        else if (this.tv.firingMode && this.tv.currentTarget >= 0 && this.gm.sub.isFiringDeckGun == false) {
            //If torpedo button selected
            if (this.currentFrame == 2) {
                //Check type in tube and ensure the selected target has one of that type assigned
                if (this.gm.sub.tube[this.tube] == 1 && this.gm.shipList[this.tv.getSelectedTarget()].G7aINCOMING > 0) {
                    this.currentFrame = 0;
                    this.gm.shipList[this.tv.getSelectedTarget()].unassignG7a();
                }
                else if (this.gm.sub.tube[this.tube] == 2 && this.gm.shipList[this.tv.getSelectedTarget()].G7eINCOMING > 0){
                    this.currentFrame = 0;
                    this.gm.shipList[this.tv.getSelectedTarget()].unassignG7e();
                }
                
                //Set tube to NOT firing in Uboat object
                this.gm.sub.assignTubeForFiring(this.tube, null)
            }
            //Otherwise select tube
            else {
                this.currentFrame = 2;

                //Check type in tube to assign to ship
                if (this.gm.sub.tube[this.tube] == 1) {
                    this.gm.shipList[this.tv.getSelectedTarget()].assignG7a();
                    this.gm.sub.assignTubeForFiring(this.tube, "G7a")
                }
                else if (this.gm.sub.tube[this.tube] == 2){
                    this.gm.shipList[this.tv.getSelectedTarget()].assignG7e();
                    this.gm.sub.assignTubeForFiring(this.tube, "G7e")
                }
            }
        }
    }

    handleEvent(event){
        const xPos = event.offsetX;
        const yPos = event.offsetY;
        if (event.type == "click"){
            if (this.withinBounds(xPos, yPos)) {
                this.click();
            }
        }
        else if (event.type == "mousemove"){
            //Hover and Unhover for firing mode
            if (this.tv.firingMode) {
                if (this.withinBounds(xPos, yPos) && this.currentState == "Active"){
                    this.changeState("Hover");
                }
                else if (!this.withinBounds(xPos, yPos) && this.currentState == "Hover"){
                    this.changeState("Active");
                }
            }
            else if (this.tv.reloadMode) {
                if (this.withinBounds(xPos, yPos) && this.currentState == "Empty"){
                    this.changeState("Empty Hover");
                }
                else if (!this.withinBounds(xPos, yPos) && this.currentState == "Empty Hover"){
                    this.changeState("Empty");
                }
            }
        }
        this.getLatestState()
    }
}