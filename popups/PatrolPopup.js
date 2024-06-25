class PatrolPopup{
    constructor(tv, gm, event) {
        this.tv = tv;
        this.gm = gm;

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");
        this.element.classList.add("PatrolMessage");
        this[event]();
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

    encounterAttackShip() {
        var encounterAttackShipArray = [];
        const bearing = randomNum(0, 359);
        const course = ["N", "NNW", "NW", "WNW", "W", "WSW", "SW", "SSW", "S", "SSE", "SE", "ESE", "E", "ENE", "NE", "NNE"];
        const courseNum = randomNum(0, 15);

        encounterAttackShipArray = ["", 
            "Smoke on the horizon, bearing ",
            "Lone ship bearing ",
            "Single ship bearing "];

        const roll = d3Roll();

        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">${encounterAttackShipArray[roll]}${bearing}, course ${course[courseNum]}!<br>
            </p>
            <button class="AttackPopup_button" id="attack">Attack</button>
        `)

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "attack"){
                //close popup, move to next attack popup
                this.done();
                //const attackPopup = new AttackStartPopup();
            }
        })

        this.container.appendChild(this.element);
    }

    encounterAttackShipEscort() {
        console.log("TODO2");
    }
    
    done(){
        this.element.remove();
    }

}