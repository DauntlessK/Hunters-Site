class DeckGunButton extends Button {
    constructor(...args){
        super(...args);

        this.currentShots = 0;
    }

    click() {
        if (this.currentState != "Disabled" && this.tv.currentTarget != 0) {
            if (this.currentShots == 0) {
                this.changeState("1 Shot");
            }
            else if (this.currentShots == 1 && this.gm.sub.deck_gun_ammo > 1) {
                this.changeState("2 Shots");
            }
            //else reset to 0 shots
            else if (this.currentShots > 0) {
                this.changeState("Active");
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
                this.currentFrame = 0;
                this.gm.shipList[this.tv.getSelectedTarget()].assignDeckGun(0);
                break;
            case "Hover":
                this.currentFrame = 1;
                break;
            case "1 Shot":
                this.currentShots = 1;
                this.currentFrame = 2;
                this.gm.shipList[this.tv.getSelectedTarget()].assignDeckGun(1);
                break;
            case "2 Shots":
                this.currentShots = 2;
                this.currentFrame = 3;
                this.gm.shipList[this.tv.getSelectedTarget()].assignDeckGun(2);
                break;
            case "Disabled":
            case "Disable":
                this.currentFrame = 5;
                break;
        }

        this.currentState = this.currentStateOptions[this.currentFrame];
    }

    //Updates state based on Uboat's status / ammo etc
    getLatestState() {
        //First check if surfaced
        if (this.gm.currentDepth) {
            //TODO
        }
        //Ensure there is ammo and not broken, or torpedoes are being fired, disable
        else if (this.gm.sub.deck_gun_ammo == 0 || this.gm.sub.systems["Deck Gun"] > 0 || 
            this.gm.shipList[0].getType() == "Escort" || this.gm.sub.isFiringTorpedoes()) {
            this.changeState("Disabled");
        }
        else if (!this.gm.sub.isFiringTorpedoes() && this.currentShots == 0) {
            this.changeState("Enabled");
        }

    }
}