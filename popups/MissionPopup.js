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

    torpedoDoorFailure() {
        //NEED MESSAGING FOR WHEN BOTH TORPEDO DOORS ARE INOP
    }

    agentDeadFailure() {
        //NEED MESSAGING FOR WHEN ABWEHR AGENT IS KIA OR SW
    }

    //Popup for aircraft attack - NOT USED??
    encounterAircraft(){

        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">Aircraft! It has sighted us as we moved in to complete our mission!<br>
            </p>
        `)

        this.container.appendChild(this.element);
    }

    
    done(id){
        if (!this.tv.isPaused) {
            this.element.remove();
            this.gm.setEventResolved(true);
            this.choice = id;
        }
    }
}