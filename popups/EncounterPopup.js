class EncounterPopup{
    constructor(tv, gm, currentBoxName, shipList) {
        this.tv = tv;
        this.gm = gm;
        this.enc = "";
        this.currentBoxName = currentBoxName;
        this.shipList = shipList;
        
        this.choice = null;

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");

        this.element.classList.add("PatrolMessage");
    }

    setEncounter(encounter) {
        this.enc = encounter;
    }
    
    /**
     * Popup when encounter is "noEncounter"
     */
    noEncounter(){
        var noEncounterArray = [];

        switch (this.gm.patrol.patrolArray[this.gm.currentBox]) {
            case "Transit":
                noEncounterArray = ["", 
                    "The sea before you is empty - the U-boat cruises onwards.",
                    "You have an uneventful transit.",
                    "You continue to sail towards your destination, finding nothing along the way."];
                break;
            case "Bay of Biscay":
                noEncounterArray = ["", 
                    "We manage to cross the treacherous Bay without issue.",
                    "You have an uneventful transit across the Bay.",
                    "You sail across the Bay of Biscay uninterrupted."];
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


    /**
     * Popup when there's no additional round rolled after
     */
    noAdditionalRound(){
        var noARArray = ["", 
            "You finally manage to dive. After a while, you surface and sail on, trying to put distance between you and the encounter with the aircraft.",
            "A little while after your crash dive, you surface and sail away without further trouble.",
            "You receive no further trouble after the aircraft attack."];

        const roll = d3Roll();

        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">${noARArray[roll]}<br>
            </p>
        `)

        this.container.appendChild(this.element);
        this.gm.setEventResolved(true);
        this.tv.finishEncounter();
    }

    /**
     * Popup when diving deep before escort detection
     * @param {string} pressureText 
     */
    diveDeep(pressureText) {
        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">${pressureText}<br>
            </p>
            <button class="AttackPopup_button" id="continue">Continue</button>
        `)

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "continue"){
                //close popup
                this.doneDiveDeep();
            }
        })

        this.container.appendChild(this.element);
    }

    /**
     * NOTE: prevEnc must be all lowercase
     * @param {string} prevEnc previous encounterType (Aircraft or unescorted ship(s))
     * @param {string} enc newly rolled encounterType
     */
    additionalRound(prevEnc, enc) {
        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">The ${prevEnc} has alerted nearby allied forces!<br>
            </p>
            <button class="AttackPopup_button" id="continue">Continue</button>
        `)

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "continue"){
                //close popup
                this.done(event.target.id);
            }
        })

        this.container.appendChild(this.element);
    }

    /**
     * Popup for aircraft attack
     */
    encounterAircraft(){

        //new div to add
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Alarm!! Aircraft!<br>
            </h3>
            <button class="AttackPopup_button" id="continue">Continue</button>
        `)

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "continue"){
                //close popup
                this.done(event.target.id);
            }
        })

        this.container.appendChild(this.element);
    }

    /**
     * Popup to notify of successful and unsuccessful repair results
     * @param {string} repairString 
     */
    repairs(repairString){

        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">${repairString}<br>
            </p>
            <button class="AttackPopup_button" id="continue">Continue</button>
        `)

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "continue"){
                //close popup
                this.done(event.target.id);
            }
        })

        this.container.appendChild(this.element);
    }

    /**
     * 
     * @param {string} result "Shot Down", "Damaged", "None", "Missed"
     */
    flak(result) {
        let message = "";
        if (result == "Shot Down") {
            message = "Yes! We got it! She's going down!"
        }
        else if ( result == "Damaged") {
            message = "Looks like we hit it! The plane has turned back home!"
        }
        else {
            message = "Flak has missed!"
        }
        //new div to add
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Flak Fire!</h3>
            <p class="PatrolMessage_p">${message}<br>
            </p>
            <button class="AttackPopup_button" id="continue">Continue</button>
        `)

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "continue"){
                //close popup
                this.done(event.target.id);
            }
        })

        this.container.appendChild(this.element);
    }

    escortArrival() {
                //new div to add
                this.element.innerHTML = (`
                    <h3 class="HeaderMessage_h3">ALARM! An escort has arrived!<br>
                    </h3>
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
        switch (this.enc) {
            case "Ship":
            case "Tanker":
                encounterAttackShipArray = ["", 
                    "Smoke on the horizon, bearing ",
                    "Lone ship bearing ",
                    "Single ship bearing "];
                break;
            case "Ship + Escort":
            case "Two Ships":
                encounterAttackShipArray = ["", 
                    "Smoke on the horizon, bearing ",
                    "Pair of ships bearing ",
                    "Two ships bearing "];
                break;
            case "Two Ships + Escort":
                encounterAttackShipArray = ["", 
                    "Smoke on the horizon, bearing ",
                    "Small group of ships bearing ",
                    "Three ships bearing "];
                break;
            case "Convoy":
                encounterAttackShipArray = ["", 
                    "Large smoke clouds on the horizon, bearing ",
                    "Convoy bearing ",
                    "Several ships bearing "];
                break;
            case "Capital Ship":
                encounterAttackShipArray = ["", 
                    "Smoke on the horizon, bearing ",
                    "Warships bearing ",
                    "Large capital ship bearing "];
                break;
            default:
                console.log("ERROR GETTING ENCOUNTER ATTACK SHIP ARRAY");
        }

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

    doneDiveDeep() {
        if (!this.tv.isPaused) {
            this.element.remove();
            this.gm.setSubEventResolved(true);
        }
    }

    getChoice() {
        return this.choice;
    }

    remove() {
        this.element.remove();
    }
}