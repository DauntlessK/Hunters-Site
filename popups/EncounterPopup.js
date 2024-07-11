class EncounterPopup{
    constructor(tv, gm, enc, shipList) {
        this.tv = tv;
        this.gm = gm;
        this.enc = enc;
        this.shipList = shipList;
        
        this.choice = null;

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");

        this.element.classList.add("PatrolMessage");
        this[enc]();
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
            case "Mission":
                if (this.currentOrders.includes("Minelaying")) {
                    noEncounterArray = ["", 
                        "Kommandant, approaching the designated mine area.",
                        "We are approaching the target mining area, Kommandant.",
                        "We are nearing the port we have been assigned to lay mines, Kommandant."];
                }
                else {
                    noEncounterArray = ["", 
                        "Kommandant, approaching the designated area to land our agent.",
                        "The agent reports that the nearing bay is perfect to land him on.",
                        "We are nearing the the shore to land our agent, Kommandant."];
                }
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
    }

    //Popup for aircraft attack
    encounterAircraft(){

        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">Aircraft!<br>
            </p>
        `)

        this.container.appendChild(this.element);
    }

    //Popup for lone ship encounter
    Ship() {
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

    encounterAttackShipEscort() {
        console.log("TODO2");
    }
    
    done(id){
        this.element.remove();
        this.gm.setEventResolved(true);
        this.choice = id;
    }

    getChoice() {
        return this.choice;
    }
}