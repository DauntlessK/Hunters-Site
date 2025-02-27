class PatrolLog{
    constructor(tv, gm) {  
        this.tv = tv;
        this.gm = gm;

        this.patrolSummaryHeader = "";
        this.patrolSummary = "";

        //Updated at the end of patrol for record keeping
        this.patrolOrdersLong = "";
        this.patrolResult = "";
        this.patrolSunk = 0;
        this.patrolGRTSunk = 0;


        this.totalGRT = 0;
        this.aborting = false;

        this.currentDay = 0;

    }

    getPatrolSummary() {
        return this.patrolSummary;
    }

    /**
     * 
     * @returns string of Header for patrol log, which includes, U-boat, name and rank, patrol #, orders and tonnage sunk
     */
    getPatrolHeader() {
        this.patrolSummaryHeader = "";
        //If not at the start of the game
        if (this.gm.patrolNum > 0) {
            //Header
            this.patrolSummaryHeader = this.patrolSummaryHeader + this.gm.getFullUboatID() + " - " + this.gm.getLRankAndName() + "<br>";
            this.patrolSummaryHeader = this.patrolSummaryHeader + this.gm.getFullDate() + ", " + this.gm.patrolCount[this.gm.patrolNum] + " patrol<br>";
            this.patrolSummaryHeader = this.patrolSummaryHeader + this.gm.currentOrdersLong;
            //Subheader - GRT Summary
            if (this.gm.shipsSunkOnCurrentPatrol.length == 1) {
                this.patrolSummaryHeader = this.patrolSummaryHeader + "<br>1 ship sunk for " + this.getTotalGRT() + " GRT <br>";
            }
            else if (this.gm.shipsSunkOnCurrentPatrol.length > 1) {
                this.patrolSummaryHeader = this.patrolSummaryHeader + "<br>" + this.gm.shipsSunkOnCurrentPatrol.length.toString() +  " ships sunk totaling " + this.getTotalGRT() + " GRT <br>";
            }
        }
        else {
            this.patrolSummaryHeader = this.gm.getFullUboatID() + " - " + this.gm.getLRankAndName() + "<br>";
            this.patrolSummaryHeader = this.patrolSummaryHeader + this.gm.getFullDate() + ", in port";
            this.patrolSummaryHeader = this.patrolSummaryHeader + "<p>Reported to boat for immediate departure.</p>" 
        }

        //Update stats for final patrol record keeping
        if (this.gm.currentBox == this.gm.patrol.getPatrolLength()) {
            this.patrolOrdersLong = this.gm.currentOrdersLong;
            if (this.gm.missionComplete) {
                this.patrolResult = "Success"
            }
            else {
                this.patrolResult = "Failure"
            }
            this.patrolSunk = this.gm.shipsSunkOnCurrentPatrol;
            this.patrolGRTSunk = this.getTotalGRT() + "GRT";
        }

        return this.patrolSummaryHeader;
    }

    addLastEncounter(enc) {
        if (this.gm.currentBox == 1) {
            this.currentDay += randomNum(1, 2);
        }
        else {
            if (this.gm.sub.getType().includes("IX") || this.gm.sub.getType() == "VIID") {
                let randomBump = d3Roll() + 5;
                this.currentDay += randomBump;
            }
            else {
                this.currentDay += d6Roll();
            }
        }
        var lineEntry = "<p>Day " + this.currentDay.toString() + "- ";

        if (enc.originalEncounterType == "No Encounter") {
            if (this.gm.patrol.patrolArray[this.gm.currentBox] == "Transit") {
                lineEntry = lineEntry + "Uneventful transit.";
            }
            else if (this.gm.patrol.patrolArray[this.gm.currentBox] == "Mission") {
                if (this.gm.currentOrders.includes("Abwehr")) {
                    lineEntry = lineEntry + "Completed mission: Successfully landed Abwehr Agent.";
                }
                else {
                    lineEntry = lineEntry + "Completed mission: Successfully deployed mines.";
                }
                
            }
            else if (this.gm.patrol.patrolArray[this.gm.currentBox] == "Bay of Biscay") {
                lineEntry = lineEntry + "Crossed Bay of Biscay, no ships or aircraft in sight.";
            }
            else {
                lineEntry = lineEntry + "Patrolled area - no ships found.";
            }
        }
        //If encounter is a ship / attack encounter
        else if (enc.originalEncounterType.includes("Ship") || enc.originalEncounterType == "Convoy" || enc.originalEncounterType.includes("Tanker")) {
            if (enc.originalEncounterType == "Convoy") {
                lineEntry = lineEntry + "Encountered convoy; ";
            }
            else if (enc.originalEncounterType == "Ship") {
                lineEntry = lineEntry + "Encountered lone ship; ";
            }
            else if (enc.originalEncounterType == "Capital Ship") {
                lineEntry = lineEntry + "Encountered large warship; ";
            }
            else {
                lineEntry = lineEntry + "Encountered ships; ";
            }

            //Results of attack
            if (enc.shipsSunkInEnc.length == 0 && enc.ignored) {
                lineEntry = lineEntry + "Did not engage. ";
            }
            else if (enc.shipsSunkInEnc.length == 0) {
                lineEntry = lineEntry + "Unable to sink any targets. ";
            }
            else {
                //sunk any ships
                var sunkText = "Sunk ";
                for (let i = 0; i < enc.shipsSunkInEnc.length; i++) {
                    sunkText = sunkText + enc.shipsSunkInEnc[i].getName() + " (" + enc.shipsSunkInEnc[i].getGRT() + "GRT)";
                    if (i != enc.shipsSunkInEnc.length - 1) {
                        sunkText = sunkText + ", ";
                    }
                    else {
                        sunkText = sunkText + ". ";
                    }
                }
                lineEntry = lineEntry + sunkText;
            }
            
            //If escorted, detail escape
            if (enc.isEscorted() && !enc.ignored) {
                if (!enc.wasDetected) {
                    lineEntry = lineEntry + "Evaded detection.";
                }
                else if (enc.wasDetected && enc.damageTaken == 0){
                    lineEntry = lineEntry + "Escaped depth charges from the " + enc.shipList[0].getName() + ".";
                }
                else if (enc.damageTaken <= 3) {
                    lineEntry = lineEntry + "Took light depth charge damage from the " + enc.shipList[0].getName() + ".";
                }
                else if (enc.damageTaken <= 7) {
                    lineEntry = lineEntry + "Took moderate depth charge damage from the " + enc.shipList[0].getName() + ".";
                }
                else{
                    lineEntry = lineEntry + "Took major depth charge damage from the " + enc.shipList[0].getName() + ".";
                }
            }
        }
        else if (enc.originalEncounterType == "Aircraft") {
            if (this.gm.patrol.patrolArray[this.gm.currentBox] == "Bay of Biscay") {
                lineEntry = lineEntry + "Encountered aircraft crossing Bay of Biscay; ";
            }
            else {
                lineEntry = lineEntry + "Encountered aircraft; ";
            }
            lineEntry = lineEntry + enc.aircraftResult;
        }
        else {
            lineEntry = lineEntry + "unknown enc";
        }

        //check first instance of when abortingPatrol flag is true but hasn't been flagged yet in patrol log
        if (this.gm.abortingPatrol && !this.aborting) {
            lineEntry += " Heavily damaged and forced to return to port."
            this.aborting = true;
        }

        this.lineEntry = this.lineEntry + "</p>";

        this.patrolSummary = this.patrolSummary + lineEntry;
    }

    /**
     * Gets current GRT sunk on this patrol
     * @returns STRING of # of GRT sunk, WITH commas: "7,400"
     */
    getTotalGRT() {
        let newTotalGRT = 0;
        for (let i = 0; i < this.gm.shipsSunkOnCurrentPatrol.length; i++) {
            newTotalGRT += this.gm.shipsSunkOnCurrentPatrol[i].getGRTInt();
        }
        this.totalGRT = newTotalGRT;
        var stringReturn = this.totalGRT.toLocaleString();
        //stringReturn.replace(/^0+/, "");
        return stringReturn;
    }

    //No encounter for transit
    noEncounter() {

    }
}