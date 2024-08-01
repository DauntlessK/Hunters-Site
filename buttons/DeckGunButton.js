class DeckGunButton extends Button {
    constructor(...args){
        super(...args);

        this.currentShots = 0;

        this.currentStateOptions = ["Active", "Hover", "1 Shot", "2 Shots", "Disabled"];
        this.currentState = this.currentStateOptions[this.currentFrame];
    }
    

    click() {
        if (this.currentState != "Disabled" && this.tv.currentTarget >= 0) {
            if (this.currentShots == 0) {
                this.changeState("1 Shot");
                this.gm.currentEncounter.shipList[this.tv.getSelectedTarget()].assignDeckGun(1);
                this.gm.sub.assignDeckGunForFiring(1);
            }
            else if (this.currentShots == 1 && this.gm.sub.deck_gun_ammo > 1) {
                this.changeState("2 Shots");
                this.gm.currentEncounter.shipList[this.tv.getSelectedTarget()].assignDeckGun(2);
                this.gm.sub.assignDeckGunForFiring(2);
            }
            //else reset to 0 shots
            else if (this.currentShots > 0) {
                this.changeState("Active");
                this.gm.currentEncounter.shipList[this.tv.getSelectedTarget()].assignDeckGun(0);
                this.gm.sub.assignDeckGunForFiring(0);
            }
        }
        this.getLatestState();
    }

    //Pass in a given state (Active, Hover, etc) and changes the frame and state
    changeState(state) {
        switch (state) {
            case "Active":
            case "Enable":
            case "Enabled":
                this.currentShots = 0;
                this.currentFrame = 0;
                break;
            case "Hover":
                this.currentFrame = 1;
                break;
            case "1 Shot":
                this.currentShots = 1;
                this.currentFrame = 2;
                break;
            case "2 Shots":
                this.currentShots = 2;
                this.currentFrame = 3;
                break;
            case "Disabled":
            case "Disable":
                this.currentShots = 0;
                this.currentFrame = 4;
                if (this.tv.currentTarget >= 0) {
                    this.gm.currentEncounter.shipList[this.tv.getSelectedTarget()].assignDeckGun(0);
                    this.gm.sub.assignDeckGunForFiring(0);
                }
                break;
        }

        this.currentState = this.currentStateOptions[this.currentFrame];
    }

    //Updates state based on Uboat's status / ammo etc
    getLatestState() {
        if (!this.tv.firingMode && this.currentState != "Active") {
            this.changeState("Active");
        }
        //Check if surfaced
        else if (this.gm.currentEncounter.depth == "Periscope Depth") {
            this.changeState("Disabled");
        }
        //Ensure there is ammo and not broken, or torpedoes are being fired, disable
        else if (this.tv.firingMode){
            if (this.gm.sub.deck_gun_ammo == 0 || this.gm.sub.systems["Deck Gun"] > 0 || 
                this.gm.currentEncounter.shipList[0].getType() == "Escort" || this.gm.sub.isFiringTorpedoes) {
                this.changeState("Disabled");
            }
            else if (this.currentState == "Hover" && this.tv.currentTarget < 0) {
                //ignore
            }
            else if (!this.gm.sub.isFiringTorpedoes && this.currentShots == 0) {
                this.changeState("Enabled");
            }
            else if (this.gm.currentEncounter.firedDeckGun) {
                this.changeState("Disabled");
            }
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
            this.getLatestState()
        }
}