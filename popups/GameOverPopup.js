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

        this.element.classList.add("StatusMessage");

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
        //Image path creations
        let rankImagePath = "images/ui/ranks/Rank" + this.gm.sub.crew_levels["Kommandant"].toString() + ".png";
        let upgradeTokenNum = 0;
        if (this.gm.uboatUpgrade) {
            upgradeTokenNum = 1;
        }
        let uboatUpgradeImagePath = "images/ui/decorations/UpgradeToken" + upgradeTokenNum +".png";
        let knightsCrossImagePath = "images/ui/decorations/KnightsCross" + (this.gm.sub.knightsCross) +".png";
        let warBadgeImagePath = "images/ui/decorations/UboatWarBadge" + (this.gm.uboatWarBadgeLevel) +".png";
        let frontClaspImagePath = "images/ui/decorations/UboatFrontClasp" + (this.gm.uboatFrontClaspLevel) +".png";
        let germanCrossImagePath = "images/ui/decorations/GermanCross" + (this.gm.germanCrossLevel) +".png";
        let woundBadgeImagePath = "images/ui/decorations/WoundBadge" + (this.gm.woundBadgeLevel) +".png";

        //Make string for pervious commands

        let previousCommands = "Prev. boats: "
        for (let i = 0; i < this.gm.pastSubs.length; i++) {
            if (i > 0) {
                previousCommands += ", ";
            }
            previousCommands += this.gm.pastSubs[i];
        }

        //Add s to patrols for career stats if not 1 patrol
        let pluralPatrols = "";
        if (this.gm.patrolNum != 1) {
            pluralPatrols = "s";
        }

        //Show best patrol GRT, or use this current one if greater
        let bestPatrol = 0;
        let currentPatrolGRT = this.gm.getPatrolTotalGRT("Int");
        if (currentPatrolGRT > this.gm.bestPatrolGRT) {
            bestPatrol = currentPatrolGRT;
        }
        else {
            bestPatrol = this.gm.bestPatrolGRT;
        }
        bestPatrol = bestPatrol.toLocaleString();

        //Get count of capital ships sunk
        let capShipsSunk = 0;
        let shipsSunkString = "";
        let orderedShipsSunk = this.gm.getShipsSunkOrderedByGRT();
        for (let i = 0; i < orderedShipsSunk.length; i++) {
            if (orderedShipsSunk[i].getType() == "Capital Ship") {
                capShipsSunk++;
            }
            shipsSunkString += orderedShipsSunk[i].getClassAndName() + ", ";
            shipsSunkString += orderedShipsSunk[i].getGRT() + " GRT<br>";
        }


        //new div to add
        this.element.innerHTML = (`
            <div class = "GameOver_Header">
                <h1 class="HeaderMessage_h1">GAME OVER!</h1>
                <h3 class="HeaderMessage_h3">${this.gm.getFullUboatID()}</h3>
                <h3 class="HeaderMessage_h3">${this.gm.getLRankAndName()}</h3>
                <p class="TextMessage_p">${this.gm.gameOverCause}<br>
                </p>
            </div>

            <div class="Patrol_Log">
                <span class="Bold">Ships Sunk:</span><br>
                ${shipsSunkString}
            </div>

            <div class="Career">
                <div class="Commander_Image">
                    <img src = "images/ui/ranks/CommanderPortrait.png" style="max-height: 140px;">
                </div>
                <div class="Career_Head">
                    <span class="Bold">${this.gm.getRankAndName()}</span><br>
                    ${this.gm.getFullUboatID()}<br>
                    ${previousCommands}<br>
                    ${this.gm.patrolNum} Patrol${pluralPatrols}<br>
                    ${this.gm.getTotalGRT("String")} GRT Sunk
                </div>
                <div class="Commander_Rank">
                    <img src = ${rankImagePath}>
                </div>                
                <div class="Career_Decorations">
                    <div class="knights_cross">
                        <img src=${knightsCrossImagePath}>
                    </div>
                    <div class="uboat_front_clasp">
                        <img src=${frontClaspImagePath}>
                    </div>
                    <div class="uboat_war_badge">
                        <img src=${warBadgeImagePath}>
                    </div>
                    <div class="wound_badge">
                        <img src=${woundBadgeImagePath}>
                    </div>
                    <div class="german_cross">
                        <img src=${germanCrossImagePath}>
                    </div>
                    <div class="upgrade_badge">
                        <img src=${uboatUpgradeImagePath}>
                    </div>
                </div>
                <div class="Career_Stats">
                    Ships sunk: ${this.gm.shipsSunk.length} <br>
                    Capital ships sunk: ${capShipsSunk} <br>
                    Planes shot down: ${this.gm.planesShotDown} <br> 
                    ---- <br>
                    Best patrol: ${bestPatrol} GRT Sunk<br>
                    Successful patrols: ${this.gm.successfulPatrols} <br>
                    Unsuccessful patrols: ${this.gm.unsuccessfulPatrols} <br> 
                    Months at sea: ${this.gm.monthsAtSea} <br>
                    Months in port: ${this.gm.monthsInPort} <br>
                    Random events: ${this.gm.randomEvents} <br>
                    ---- <br>
                    Times found by planes: ${this.gm.numPlaneEncounters} <br>
                    Times attacked by planes: ${this.gm.numPlaneAttacks} <br>
                    Times detected: ${this.gm.numTimesDetected} <br>
                    Damage done: ${this.gm.damageDone} <br>
                    Damage taken: ${this.gm.hitsTaken} <br>
                    Sailors lost: ${this.gm.sailorsLost} <br>
                </div>
            </div>
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

        let currentPatrol = this.gm.getCurrentPatrol();
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
                text = cause;
                return text;
        }
    }
}