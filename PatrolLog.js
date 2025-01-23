class PatrolLog{
    constructor(tv, gm) {  
        this.tv = tv;
        this.gm = gm;

        this.patrolSummaryHeader = "";
        this.patrolSummary = "";
        this.totalGRT = 0;
        this.aborting = false;

        this.currentDay = d6Roll();

    }

    getPatrolSummary() {
        return this.patrolSummary;
    }

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

        return this.patrolSummaryHeader;
    }

    addLastEncounter(enc) {
        this.currentDay = this.currentDay + d6Roll();
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
            if (enc.isEscorted()) {

                if (!enc.wasDetected) {
                    lineEntry = lineEntry + "Evaded detection.";
                }
                if (enc.wasDetected && enc.damageTaken == 0){
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
            lineEntry = lineEntry + "Encountered Aircraft; ";
            lineEntry = lineEntry + enc.aircraftResult;
        }
        else {
            lineEntry = lineEntry + "unknown enc";
        }

        //check first instance of when abortingPatrol flag is true but hasn't been flagged yet in patrol log
        if (this.gm.abortingPatrol && !this.aborting) {
            lineEntry += " Damaged beyond repair and forced to return to port."
        }

        this.lineEntry = this.lineEntry + "</p>";

        this.patrolSummary = this.patrolSummary + lineEntry;
    }

    //Gets current GRT sunk on this patrol
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