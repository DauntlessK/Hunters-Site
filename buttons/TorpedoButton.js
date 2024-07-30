class TorpedoButton extends Button{
    constructor(...args){
        super(...args);
        this.tubeState = "emptyAndReloading";    //can be empty, empty and reloading, and ready

        this.currentStateOptions = ["Active", "Hover", "Pressed", "Disabled", "Empty", "Empty Hover", "G7a", "G7e"];
        this.currentState = this.currentStateOptions[this.currentFrame];
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
            //Disable conditions - first if already fired that side of the boat
            if ((this.gm.currentEncounter.firedFore && this.tube <= 4) || (this.gm.currentEncounter.firedAft) && this.tube >= 5) {
                this.changeState("Disabled");
            }
            //Disable if that side of the boat's torpedo doors are broken
            else if ((this.tube <= 4 && this.gm.sub.systems["Forward Torpedo Doors"] > 0) || (this.tube >= 5 && this.gm.sub.systems["Aft Torpedo Doors"] > 0)) {
                this.changeState("Disabled");
            }
            //Disable if mines are loaded on that side of the boat
            else if ((this.tube <= 4 && this.gm.sub.minesLoadedForward) || (this.tube >= 5 && this.gm.sub.minesLoadedForwardAft)) {
                this.changeState("Disabled");
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
        else if (this.tv.firingMode && this.tv.currentTarget >= 0 && this.gm.sub.isFiringDeckGun == 0) {
            //First check to ensure the tube pressed can be fired
            //Check Torpedo Doors are operational
            if (this.gm.sub.systems["Forward Torpedo Doors"] > 0 && this.tube <= 4) {
                console.log("Forward Torpedo Doors Broken");
            }
            else if (this.gm.sub.systems["Aft Torpedo Doors"] > 0 && this.tube >= 5) {
                console.log("Aft Torpedo Doors Broken");
            }
            //Check if trying to fire other end torpedoes when not allowed to fire fore and aft
            else if (this.gm.sub.isFiringFore && this.gm.currentEncounter.canFireForeAndAft && this.tube >= 5) {
                console.log("Cannot fire aft torpedoes now when already firing forward torpedoes.")
            }
            else if (this.gm.sub.isFiringAft && this.gm.currentEncounter.canFireForeAndAft && this.tube <= 4) {
                console.log("Cannot fire forward torpedoes now when already firing aft torpedoes.")
            }
            //If torpedo button selected
            else if (this.currentState == "Pressed") {
                //Check type in tube and ensure the selected target has one of that type assigned
                if (this.gm.sub.tube[this.tube] == 1 && this.gm.currentEncounter.shipList[this.tv.getSelectedTarget()].G7aINCOMING > 0) {
                    this.changeState("Active");
                    this.gm.currentEncounter.shipList[this.tv.getSelectedTarget()].unassignG7a();
                }
                else if (this.gm.sub.tube[this.tube] == 2 && this.gm.currentEncounter.shipList[this.tv.getSelectedTarget()].G7eINCOMING > 0){
                    this.changeState("Active");
                    this.gm.currentEncounter.shipList[this.tv.getSelectedTarget()].unassignG7e();
                }
                
                //Set tube to NOT firing in Uboat object
                this.gm.sub.assignTubeForFiring(this.tube, null)
            }
            //Otherwise select tube
            else {
                if ((!this.gm.currentEncounter.firedFore && this.tube <= 4) || (!this.gm.currentEncounter.firedAft) && this.tube >= 5) {
                    this.changeState("Pressed");

                    //Check type in tube to assign to ship
                    if (this.gm.sub.tube[this.tube] == 1) {
                        this.gm.currentEncounter.shipList[this.tv.getSelectedTarget()].assignG7a();
                        this.gm.sub.assignTubeForFiring(this.tube, "G7a")
                    }
                    else if (this.gm.sub.tube[this.tube] == 2){
                        this.gm.currentEncounter.shipList[this.tv.getSelectedTarget()].assignG7e();
                        this.gm.sub.assignTubeForFiring(this.tube, "G7e")
                    }
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
                if ((!this.gm.currentEncounter.firedFore && this.tube <= 4) || (!this.gm.currentEncounter.firedAft) && this.tube >= 5) {
                    if (this.withinBounds(xPos, yPos) && this.currentState == "Active"){
                        this.changeState("Hover");
                    }
                    else if (!this.withinBounds(xPos, yPos) && this.currentState == "Hover"){
                        this.changeState("Active");
                    }
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
        this.getLatestState();
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
        this.getLatestState();
    }
}