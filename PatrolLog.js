class PatrolLog{
    constructor(tv, gm) {  
        this.tv = tv;
        this.gm = gm;

        this.patrolSummaryHeader = "";
        this.patrolSummary = "";
        this.totalGRT = 0;

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
            else {
                lineEntry = lineEntry + "Encountered ships; ";
            }

            //Results of attack
            if (enc.shipsSunkInEnc.length == 0 && enc.ignored) {
                lineEntry = lineEntry + "Did not engage. ";
            }
            else if (enc.shipsSunk.length == 0) {
                lineEntry = lineEntry + "Unable to sink any targets. ";
            }
            else {
                //sunk any ships
                var sunkText = "Sunk ";
                for (let i = 0; i < enc.shipsSunk.length; i++) {
                    sunkText = sunkText + enc.shipsSunk[i].getName() + ", " + enc.shipsSunk[i].getGRT() + "GRT";
                    if (i != enc.shipsSunk.length - 1) {
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
                if (enc.wasDetected){
                    lineEntry = lineEntry + "Escaped depth charges from " + enc.shipList[0].getName();
                }
                else {
                    lineEntry = lineEntry + "Evaded detection.";
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

        this.lineEntry = this.lineEntry + "</p>";

        this.patrolSummary = this.patrolSummary + lineEntry;
    }

    //Gets current GRT sunk on this patrol
    getTotalGRT() {
        this.totalGRT = 0;
        for (let i = 0; i < this.gm.shipsSunkOnCurrentPatrol.length; i++) {
            this.totalGRT = this.totalGRT + this.gm.shipsSunkOnCurrentPatrol[i].getGRT();
        }
        var stringReturn = this.totalGRT.toString();
        stringReturn.replace(/^0+/, "");
        return stringReturn;
    }

    //No encounter for transit
    noEncounter() {

    }
}