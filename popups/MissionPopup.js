class MissionPopup{
    constructor(tv, gm, encounterType, currentOrders) {
        this.tv = tv;
        this.gm = gm;
        this.currentOrders = currentOrders      //"Abwehr" or "Minelaying"
        this.encounterType = encounterType;     //"No Encounter" or "Aircraft" or "Escort"

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");

        this.element.classList.add("PatrolMessage");
    }

    //Popup for Success
    missionSuccess(missionType) {

        var missionSuccessArray = [];

        //Get text for Success
        //Abwehr Agent Delivery Success
        if (missionType.includes("Abwehr")){
            missionSuccessArray = ["", 
                "The agent is set safely on shore.",
                "The agent is taken quietly and safely to the beach nearby.",
                "Your crew successfully land the agent on enemy land."];
        }
        //Minelaying Success
        else {
            missionSuccessArray = ["", 
                "The mines leave their tubes without any issues.",
                "The U-boat successfully deploys the mines within the target area.",
                "The mines you laid are armed and ready to take out enemy shipping."];
        }

        const roll = d3Roll();

        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">${missionSuccessArray[roll]}<br>
            </p>
        `)

        this.container.appendChild(this.element);
        this.gm.setEventResolved(true);
        this.tv.finishEncounter();
    }

    /**
     * Popup in the rare case both fore and aft torpedo doors are inop when trying to complete a minelaying mission
     */
    torpedoDoorFailure() {

        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">Both fore and aft torpedo doors are jammed broken. We are unable to
            deploy our mines to complete the mission.<br>
            </p>
        `)

        this.container.appendChild(this.element);
        this.gm.setEventResolved(true);
        this.tv.finishEncounter();
    }

    /**
     * Popup in the rare case that the Abwehr agent aboard is SW or KIA when trying to complete the agent delivery mission
     */
    agentDeadFailure() {
        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">We are unable to land the agent - he's ${this.gm.sub.getCrewHealth("Abwehr Agent")}.<br>
            </p>
        `)

        this.container.appendChild(this.element);
        this.gm.setEventResolved(true);
        this.tv.finishEncounter();
    }

    //Popup for aircraft attack - NOT USED??
    encounterAircraft(){

        //new div to add
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Aircraft!</h3>
            <p class="PatrolMessage_p">It has sighted us as we moved in to complete our mission!<br>
            </p>
            <button class="ContinuePopup_button" id="continue2">Continue</button>
        `)

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "continue2") {
                this.done();
            }
        })

        this.container.appendChild(this.element);
    }

    
    done(id){
        if (!this.tv.isPaused) {
            this.element.remove();
            this.gm.setEventResolved(true);
        }
    }

    remove() {
        this.element.remove();
    }
}