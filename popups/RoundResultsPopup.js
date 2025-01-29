class RoundResultsPopup{
    constructor(tv, gm, enc) {
        this.tv = tv;
        this.gm = gm;
        this.enc = enc;

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");

        this.element.classList.add("PatrolMessage");

        if (this.enc.roundFired > 0) {
            this.showResultsTorpedo();
        }
        else {
            this.showResultsDeckGun();
        }
    }

    //Shows hits / damage if deck gun hits
    showResultsDeckGun() {
        var hitMessage = "";

        if (this.enc.roundDam == 0) {
            hitMessage = "Deck gun fire ineffective! No damage!"
        }
        else {
            for (let i = 0; i < this.enc.shipList.length; i++) {
                if (this.enc.shipList[i].roundHits == 2) {
                    hitMessage = "2 hits on " + this.enc.shipList[i].name + "! She's taken " + this.enc.shipList[i].roundDam + " damage! ";
                }
                else {
                    hitMessage = "1 hit on " + this.enc.shipList[i].name + "! She's taken " + this.enc.shipList[i].roundDam + " damage! ";
                }
                if (this.enc.shipList[i].roundSunk) {
                    hitMessage = hitMessage + "She's sinking!";
                }
            }
        }

        this.element.innerHTML = (`
            <p class="PatrolMessage_p">
            ${hitMessage}
            <button class="AttackPopup_button" id="continue">Continue</button>
            </p>
        `)
    

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "continue"){
                //get selected value and close popup
                this.done();
            }
        })

        this.container.appendChild(this.element);

    }
    
    //Popup to show number of hits, missed and duds from resolution of torpedoes
    showResultsTorpedo(){
        //new div to add

        //See if all torpedoes missed first
        if (this.enc.roundHits == 0) {
            //Show message on all shots missed - vary between 1, 2 and 3+ torpedoes missing (Torpedo missed / both torpedoes missed / all missed)
            var missedMessage = "";
            var numFired = this.enc.roundFired;
            var numMissed = this.enc.roundFired - (this.enc.roundHits + this.enc.roundDuds);
            var numDuds = this.enc.roundDuds;

            if (numFired == 1 && numDuds == 0) {
                missedMessage = "Torpedo Missed!"
            }
            else if (numFired == 1 && numDuds == 1) {
                missedMessage = "Torpedo was a dud!"
            }
            else if (numFired == 2 && numDuds == 0) {
                missedMessage = "Both torpedoes missed!"
            }
            else if (numFired == 2 && numDuds == 1) {
                missedMessage = "One torpedo missed! The other was a dud."
            }
            else if (numFired == 2 && numDuds == 2) {
                missedMessage = "Both torpedoes were duds!"
            }
            else {  //Messages for when at LEAST 3 torpedoes have been fired.
                if (numMissed > 0 && numDuds > 0) {
                    missedMessage = numMissed.toString() + " torpedoes missed. " + numDuds.toString() + " duds!";
                }
                else if (numMissed > 0 && numDuds == 0) {
                    missedMessage = "All " + numMissed.toString() + " torpedoes missed. Verdammt!"; 
                }
                else if (numMissed == 0 && numDuds > 0) {
                    missedMessage = "All " + numDuds.toString() + " torpedoes were duds. 25,000 Marks each for torpedoes that don't work!"; 
                }
                else {
                    console.log("Error getting missedMessage");
                }

            }
            this.element.innerHTML = (`
                <p class="PatrolMessage_p">
                ${missedMessage}
                <button class="AttackPopup_button" id="continue">Continue</button>
                </p>
            `)
        }
        else {
            //Else if at least 1 torpedo hit
            var hitMessage = "";
            for (let i = 0; i < this.enc.shipList.length; i++) {
                if (this.enc.shipList[i].roundHits > 1) {
                    hitMessage = hitMessage + this.enc.shipList[i].roundHits.toString() + " hits on " + this.enc.shipList[i].name + "! ";
                    if (this.enc.shipList[i].roundDuds > 1) {
                        hitMessage = hitMessage + this.enc.shipList[i].roundDuds.toString() + " duds!"
                    }
                    else if (this.enc.shipList[i].roundDuds == 1) {
                        hitMessage = hitMessage + "1 dud! "
                    }
                    
                    hitMessage = hitMessage + " She suffered " + this.enc.shipList[i].roundDam + " damage. "
                    if (this.enc.shipList[i].roundSunk) {
                        hitMessage = hitMessage + "She's sinking!";
                    }
                    hitMessage = hitMessage + "\n"
                }
                else if (this.enc.shipList[i].roundHits == 1) {
                    hitMessage = hitMessage + this.enc.shipList[i].roundHits.toString() + " hit on " + this.enc.shipList[i].name + "! ";
                    if (this.enc.shipList[i].roundDuds > 1) {
                        hitMessage = hitMessage + this.enc.shipList[i].roundDuds.toString() + " duds!"
                    }
                    else if (this.enc.shipList[i].roundDuds == 1) {
                        hitMessage = hitMessage + "1 dud! "
                    }
                    
                    hitMessage = hitMessage + " She suffered " + this.enc.shipList[i].roundDam + " damage. "
                    if (this.enc.shipList[i].roundSunk) {
                        hitMessage = hitMessage + "She's sinking!";
                    }
                    hitMessage = hitMessage + "\n"
                }
            }
            this.element.innerHTML = (`
                <h3 class="HeaderMessage_h3">Treffe! </h3>
                <p class="PatrolMessage_p">
                ${hitMessage}
                <button class="AttackPopup_button" id="continue">Continue</button>
                </p>
            `)
        }

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "continue"){
                //get selected value and close popup
                this.done();
            }
        })

        this.container.appendChild(this.element);
    }
    
    done(){
        if (!this.tv.isPaused) {
            this.element.remove();
            this.gm.setEventResolved(true);
        }
    }
}