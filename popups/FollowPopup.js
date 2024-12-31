class FollowPopup{
    constructor(tv, gm, enc) {
        this.tv = tv;
        this.gm = gm;
        this.enc = enc;
        this.shipList = this.enc.shipList;

        this.option = "";

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");

        this.element.classList.add("FollowMessage");
        this.followPopup();
    }
    
    //Popup to allow the player to choose a target to follow, or ignore and move on
    followPopup(){

        //new div to add
        //Create html for options
        this.element.innerHTML = this.buildSelectionsHTML();

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "continue"){
                //get selected value and close popup
                this.done();
            }
        })

        this.container.appendChild(this.element);
    }

    //returns HTML text for the body which contains all selections
    buildSelectionsHTML() {
        var bodyText = '<h3 class="HeaderMessage_h3">Follow Orders?</h3><p class="FollowMessage_p">';

        //Get sinkable ships first in opposite order
        for (let i = this.shipList.length-1; i >= 0; i--) {
            if (this.shipList[i].getType() == "Escort") {
                continue;
            }
            if (i != this.shipList.length-1 && !this.shipList[i].sunk) {
                bodyText = bodyText + "<br>";
            }
            if (!this.shipList[i].sunk) {
                bodyText = bodyText + '<input type="radio" id="Ship' + i.toString() + '"  name="options" value="Ship' + i.toString() + '">';
                bodyText = bodyText + '<label for="Ship' + i.toString() + '">' + this.shipList[i].getName() + '</label>';
            }
        }
        //Add convoy option if possible
        if (this.enc.encounterType == "Convoy") {
            bodyText = bodyText + "<br>";
            bodyText = bodyText + '<input type="radio" id="Convoy" name="options" value="Convoy"><label for="Convoy">-Convoy-</label>';
        }
        //Add Ignore option
        bodyText = bodyText + '<br><input type="radio" id="Ignore" name="options" value="Ignore"><label for="Ignore"><strong>Continue Patrol</strong></label>';
        //Add continue button
        bodyText = bodyText + '<button class="AttackPopup_button" id="continue">Continue</button></p>';

        return bodyText;
    }
    
    done(){
        if (!this.tv.isPaused) {
            this.option = document.querySelector('input[name="options"]:checked').value;
            this.element.remove();
            this.gm.setEventResolved(true);
        }
    }

    getOption() {
        return this.option;
    }

}