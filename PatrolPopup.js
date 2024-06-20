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
        const noEncounterArray = ["", "The sea before you is empty.", "Kommandant, there are no sightings in the vicinity.", "No sightings of any ships in the area.", 
                                    "A dense, lingering fog has prevented us from finding anything.", "There are no contacts in the vicinity.", "Nothing to report at this stage of our patrol."]
        const roll = d6Roll();

        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">${noEncounterArray[roll]}<br>
            </p>
        `)

        this.container.appendChild(this.element);
    }
    
    done(){
        this.element.remove();
        this.gm.eventResolved = true;
        this.tv.unpauseGame();
    }

}