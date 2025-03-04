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
            <p class="PatrolMessage_p">After the chaos of the crash drive, the boat successfully slips beneath the waves.<br>
            </p>
        `)

        this.container.appendChild(this.element);
    }

    /**
     * Successful dive upon being attacked when trying to complete mission. This has a continue box to try again.
     */
    successfulDiveMissionAttempt(){

        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">After a chaotic crash dive in shallow waters, we've slipped away. We will return to try and complete the mission again.<br>
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
    
    //Popup when encounter is "noEncounter"
    noEncounter(){
        var noEncounterArray = [];

        switch (this.gm.patrol.patrolArray[this.gm.currentBox]) {
            case "Transit":
                noEncounterArray = ["", 
                    "The sea before you is empty - the U-boat cruises onwards.",
                    "You have an uneventful transit.",
                    "You continue to sail towards your destination, finding nothing along the way."];
                break;
            case "Gibraltar":
                noEncounterArray = ["", 
                    "In the cover of night you were able to slip through the Gibraltar patrols.",
                    "A foggy morning and some luck allow you to pass unnoticed through Gibraltar.",
                    "A timely storm pushes several patrolling ships off station, allowing you to run straight through Gibraltar."];
                break;
            default:
                noEncounterArray = ["", 
                    "Our patrol of this area has been uneventful.",
                    "No luck on this leg of your patrol - the seas are empty.",
                    "There are no ships in the area."];
        
        }

        const roll = d3Roll();

        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">${noEncounterArray[roll]}<br>
            </p>
        `)

        this.container.appendChild(this.element);
        this.gm.setEventResolved(true);
        this.tv.finishEncounter();
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

    //Popup for mission (abwehr agent or minelaying)
    mission() {
        var missionArray = [];

        if (this.gm.currentOrders.includes("Minelaying")) {
            missionArray = ["", 
                "Kommandant, approaching the designated mine area.",
                "We are approaching the target mining area, Kommandant.",
                "We are nearing the port we have been assigned to lay mines, Kommandant."];
        }
        else {
            missionArray = ["", 
                "Kommandant, approaching the designated area to land our agent.",
                "The agent reports that the bay we are nearing is perfect to land him on.",
                "We are nearing the the shore to land our agent, Kommandant."];
        }

        const roll = d3Roll();

        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">${missionArray[roll]}<br>
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

    //Popup for ships encounter
    ships() {
        var encounterAttackShipArray = [];
        const bearing = randomNum(0, 359);
        const course = ["N", "NNW", "NW", "WNW", "W", "WSW", "SW", "SSW", "S", "SSE", "SE", "ESE", "E", "ENE", "NE", "NNE"];
        const courseNum = randomNum(0, 15);
        var currTime = this.tv.time;
        var oppositeTime = null;

        if (currTime == "Day") {
            oppositeTime = "Night";
        }
        else {
            oppositeTime = "Day";
        }
        //NEED OTHER ENCOUNTER ARRAYS
        encounterAttackShipArray = ["", 
            "Smoke on the horizon, bearing ",
            "Lone ship bearing ",
            "Single ship bearing "];

        const roll = d3Roll();

        //new div to add
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Alarm!</h3>
            <p class="PatrolAttackMessage_p">${encounterAttackShipArray[roll]}${bearing}, course ${course[courseNum]}!<br>
            Orders, Herr Kaleun? <br>
            </p>
            <button class="AttackPopup_button" id="attack">Attack</button>
            <button class="WaitPopup_button" id="wait">Follow Until ${oppositeTime}</button>
            <button class="PassPopup_button" id="ignore">Ignore</button>
        `)

        this.element.addEventListener("click", ()=> {
            var action = null;
            if (event.target.id == "attack" || event.target.id == "wait" || event.target.id == "ignore"){
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