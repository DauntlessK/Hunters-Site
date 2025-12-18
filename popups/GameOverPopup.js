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
        this.gm.survivalStatus = this.getSurvivalStatus();

        console.log("Game Over Cause: " + this.gm.gameOverCause);

        this.gm.fetch();
        this.gm.setEventResolved(false);
        this.tv.pauseGame(true);
        this.enc.closeWindows();

        this.gameOver();
    }

    /**
     * 
     * @returns Short string of player's status at the end of the game
     */
    getSurvivalStatus() {
        if (this.gm.isWarOver()) {
            return "Alive";
        }
        else if (this.cause.includes("Lost")) {
            return "MIA";
        }
        else if (this.cause.includes("Scuttled")) {
            return "POW";
        }
        else {
            return "KIA";
        }
    }

    /**
     * Creates HTML popup for game over screen.
     */
    gameOver() {
        //new div to add
        this.element.innerHTML = (`
            <h1 class="HeaderMessage_h1">GAME OVER!</h1>
            <h3 class="HeaderMessage_h3">${this.gm.getFullUboatID()}</h3>
            <h3 class="HeaderMessage_h3">${this.gm.getLRankAndName()}</h3>
            <p class="TextMessage_p">${this.gm.gameOverCause}<br>
            </p>
        `)

        this.container.appendChild(this.element);
        this.tv.pauseGame(true);

        return;
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
        console.log(this.gm);
        console.log(this.gm.patrols);
        console.log(this.gm.patrolNum);
        let currentPatrol = this.gm.getCurrentPatrol();
        console.log(currentPatrol);
        let currentDeathOrdersAndLocation = currentPatrol.getCurrentDeathOrdersAndLocation()


        let text = "";
        switch(cause) {
            case "Hull implosion":
                text = "Sunk " + this.gm.getFullDate();
                text += ": Hull imploded by pressure while escaping the " + this.gm.currentEncounter.shipList[0].getClassAndName() + currentDeathOrdersAndLocation;
                return text;
            case "Hull destroyed by aircraft":
                text = "Sunk " + this.gm.getFullDate();
                text += ": Hull destroyed from air attack by " + attacker + currentDeathOrdersAndLocation;
                return text;
            case "Hull destroyed by pressure":
                text = "Sunk " + this.gm.getFullDate();
                text += ": Hull crushed by pressure escaping the " + attacker + currentDeathOrdersAndLocation;
                return text;
            case "Hull destroyed by escort":
                text = "Sunk " + this.gm.getFullDate();
                text += ": Hull destroyed by depth charges by the " + this.gm.currentEncounter.shipList[0].getClassAndName() + currentDeathOrdersAndLocation;
                return text;
            case "Scuttled due to flooding by aircraft":
                text = "Scuttled " + this.gm.getFullDate();
                text += ": Forced to scuttle from air attack flooding by " + attacker + currentDeathOrdersAndLocation;
                return text;
            case "Scuttled due to flooding by escort":
                text = "Scuttled " + this.gm.getFullDate();
                text += ": Forced to surface and scuttle from depth charge damage flooding by the " + this.gm.currentEncounter.shipList[0].getClassAndName() + currentDeathOrdersAndLocation;
                return text;
            case "Kommandant KIA":
                text = "Kommandant killed in action by " + attacker + currentDeathOrdersAndLocation;
                return text;
            case "Lost at sea by aircraft":
                text = "Lost at sea " + this.gm.getFullDate();
                text += ": Went missing after scuttling from damage to both diesel engines by aircraft from " + this.gm.currentEncounter.aircraftType[numAircraft] + currentDeathOrdersAndLocation;
                return text;
            case "Lost at sea by escort":
                text = "Lost at sea " + this.gm.getFullDate();
                text += ": Went missing after scuttling from damage to both diesel engines by the " + this.gm.currentEncounter.shipList[0].getClassAndName() + currentDeathOrdersAndLocation;
                return text;
            case "Scuttled due to diesel engine damage by aircraft":
                text = "Scuttled " + this.gm.getFullDate();
                text += ": Forced to scuttle after damage to both diesel engines by aircraft from " + this.gm.currentEncounter.aircraftType[numAircraft] + currentDeathOrdersAndLocation;
                return text;
            case "Scuttled due to diesel engine damage by escort":
                text = "Scuttled " + this.gm.getFullDate();
                text += ": Forced to scuttle after damage to both diesel engines by the " + this.gm.currentEncounter.shipList[0].getClassAndName() + currentDeathOrdersAndLocation;
                return text;
            case "Catastrophic damage by Aircraft":
                text = "Sunk " + this.gm.getFullDate();
                text += ": Sunk due to catastrophic damage inflicted by " + attacker + currentDeathOrdersAndLocation;
                return text;
            case "Catastrophic damage by Escort":
                text = "Sunk " + this.gm.getFullDate();
                text += ": Sunk due to catastrophic damage inflicted by depth charges from the " + this.gm.currentEncounter.shipList[0].getClassAndName() + currentDeathOrdersAndLocation;
                return text;
            case "War is over":
                if (this.gm.getLRankAndName().includes("Kapitan zur See")) {
                    text = "Survived war, promoted to a desk job in the training flotilla."
                }
                else {
                    text = "Survived.";
                }
                return text;
            default:
                text = "Unknown cause of death: " + cause;
                return text;
        }
    }
}