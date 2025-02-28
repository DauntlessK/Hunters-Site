class AircraftPopup{
    constructor(tv, gm, enc, currentBoxName, aircraftType) {
        this.tv = tv;
        this.gm = gm;
        this.enc = enc;
        this.currentBoxName = currentBoxName;
        this.aircraftType = aircraftType;

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");

        this.element.classList.add("AircraftDamageMessage");
    }

    successfulDive() {

        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">After the chaos of the crash dive, the boat successfully slips beneath the waves.<br>
            </p>
        `)

        this.container.appendChild(this.element);
    }

    /**
     * Popup when an aircraft makes a successful attack that results in damage (and an injury) 
     * @param {string} result 
     * @param {string} result2 
     * @param {boolean} twoHit 
     */
    hit(hitNum, result, result2, twoHit) {

        //new div to add
        if (twoHit) {
            this.element.innerHTML = (`
                <h3 class="HeaderMessage_h3">We've been caught with our pants down! Damage Report! </h3>
                <p class="DetectionTextMessage_p">${this.aircraftType} has made an attack run and is turning around for another! ${hitNum} hits!<br><br>
                ${result} <br> ${result2}
                <button class="ContinuePopup_button" id="continue2">Continue</button>
                </p>`)
        }
        else if (result2 != "") {
            this.element.innerHTML = (`
                <h3 class="HeaderMessage_h3">Damage Report! </h3>
                <p class="DetectionTextMessage_p">${this.aircraftType} has made an attack run!<br><br>
                ${result} <br> ${result2}
                <button class="ContinuePopup_button" id="continue2">Continue</button>
                </p>`)
        }
        else {
            this.element.innerHTML = (`
                <h3 class="HeaderMessage_h3">Damage Report! </h3>
                <p class="DetectionTextMessage_p">${this.aircraftType} has made a second attack run!<br><br>
                ${result} <br>
                <button class="ContinuePopup_button" id="continue2">Continue</button>
                </p>`)
        }

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "continue2") {
                this.done();
            }
        })

        this.container.appendChild(this.element);
    }

    missionTryAgain() {
        
        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">We'll have to return later to attempt mission again.<br>
            </p>
            <button class="AttackPopup_button" id="continue">Continue</button>
        `)

        this.element.addEventListener("click", ()=> {
            var action = null;
            if (event.target.id == "continue"){
                //close popup
                this.done(event.target.id);
            }
        })

        this.container.appendChild(this.element);
    }

    //Popup for aircraft attack
    encounterAircraft(){

        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">Aircraft!<br>
            </p>
            <button class="AttackPopup_button" id="continue">Continue</button>
        `)

        this.element.addEventListener("click", ()=> {
            var action = null;
            if (event.target.id == "continue"){
                //close popup
                this.done(event.target.id);
            }
        })

        this.container.appendChild(this.element);
    }
    
    done(id){
        if (!this.tv.isPaused) {
            this.element.remove();
            this.gm.setEventResolved(true);
            this.choice = id;
        }
    }

    getChoice() {
        return this.choice;
    }

    remove() {
        this.element.remove();
    }
}