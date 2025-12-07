class GameOverPopup{
    constructor(tv, gm, enc, cause, attacker) {
        this.tv = tv;
        this.gm = gm;
        this.enc = enc;
        this.cause = cause;
        this.gameOverText = "";     //This is the generated full game over cause text

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");

        this.element.classList.add("TextMessage");

        //Set game over info in GM
        this.gm.gameOverCause = this.getCauseText(cause, attacker);
        this.gm.gameOverEncounter = enc;

        this.gm.fetch();
        this.gm.setEventResolved(false);
        this.tv.pauseGame(true);
        this.enc.closeWindows();

        this.gameOver();
    }

    gameOver() {
        //new div to add
        this.element.innerHTML = (`
            <h1 class="HeaderMessage_h1">GAME OVER!</h1>
            <h3 class="HeaderMessage_h3">${this.gm.getFullUboatID()}</h3>
            <h3 class="HeaderMessage_h3">${this.gm.getLRankAndName()}</h3>
            <p class="TextMessage_p">${this.cause}<br>
            </p>
        `)

        this.container.appendChild(this.element);
        this.tv.pauseGame(true);
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

    /**
     * Generates summary of cause of death for high scores
     * @param {string} cause 
     * @returns string of the full cause of death
     */
    getCauseText(cause, attacker) {
        let text = "";
        switch(cause) {
            case "Hull implosion":
                text = "Sunk " + this.gm.getFullDate();
                text += " - Hull catastrophically imploded escaping the " + attacker + this.gm.patrols[this.gm.patrolNum].getCurrentDeathOrdersAndLocation();
                return text;
            case "Hull destroyed by aircraft":
                text = "Sunk " + this.gm.getFullDate();
                text += " - Hull destroyed from air attack by " + attacker + this.gm.patrols[this.gm.patrolNum].getCurrentDeathOrdersAndLocation();
                return text;
            case "Hull destroyed by pressure":
                text = "Sunk " + this.gm.getFullDate();
                text += " - Hull crushed by pressure escaping the " + attacker + this.gm.patrols[this.gm.patrolNum].getCurrentDeathOrdersAndLocation();
                return text;
            case "Hull destroyed by escort":
                text = "Sunk " + this.gm.getFullDate();
                text += " - Hull destroyed by depth charges by the " + attacker + this.gm.patrols[this.gm.patrolNum].getCurrentDeathOrdersAndLocation();
                return text;
            case "Scuttled due to flooding by aircraft":
                text = "Scuttled " + this.gm.getFullDate();
                text += " - Forced to scuttle from air attack flooding by " + attacker + this.gm.patrols[this.gm.patrolNum].getCurrentDeathOrdersAndLocation();
                return text;
            case "Scuttled due to flooding by escort":
                text = "Scuttled " + this.gm.getFullDate();
                text += " - Forced to surface and scuttle from depth charge damage flooding by the " + attacker + this.gm.patrols[this.gm.patrolNum].getCurrentDeathOrdersAndLocation();
                return text;
            case "Kommandant KIA":
                text = "Kommandant killed in action by " + attacker + this.gm.patrols[this.gm.patrolNum].getCurrentDeathOrdersAndLocation();
                return text;
            case "Lost at sea by aircraft":
                text = "Lost at sea " + this.gm.getFullDate();
                text += " - Went missing after scuttling from damage to both diesel engines by aircraft from " + this.gm.currentEncounter.aircraftType[numAircraft] + this.gm.patrols[this.gm.patrolNum].getCurrentDeathOrdersAndLocation();
                return text;
            case "Lost at sea by escort":
                text = "Lost at sea " + this.gm.getFullDate();
                text += " - Went missing after scuttling from damage to both diesel engines by the " + this.gm.currentEncounter.shipList[0].getClassAndName();
                return text;
            case "Scuttled due to diesel engine damage by aircraft":
                text = "Scuttled " + this.gm.getFullDate();
                text += " - Forced to scuttle after damage to both diesel engines by aircraft from " + this.gm.currentEncounter.aircraftType[numAircraft] + this.gm.patrols[this.gm.patrolNum].getCurrentDeathOrdersAndLocation();
                return text;
            case "Scuttled due to diesel engine damage by escort":
                text = "Scuttled " + this.gm.getFullDate();
                text += " - Forced to scuttle after damage to both diesel engines by the " + this.gm.currentEncounter.shipList[0].getClassAndName();
                return text;
            default:
                text = "Unknown cause of death: " + cause;
                return text;
        }
    }
}