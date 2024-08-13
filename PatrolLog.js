class PatrolLog{
    constructor(tv, gm) {  
        this.tv = tv;
        this.gm = gm;

        this.patrolSummary = "";
        this.totalGRT = 0;

        this.currentDay = d6Roll();

        this.setHeader();
    }

    getPatrolSummary() {
        return this.patrolSummary;
    }

    setHeader() {
        //Header
        this.patrolSummary = this.patrolSummary + this.gm.getFullUboatID() + " - " + this.gm.getLRankAndName() + "<br>";
        this.patrolSummary = this.patrolSummary + this.gm.getFullDate() + ", " + this.gm.patrolCount[this.gm.patrolNum] + " patrol<br>";
        this.patrolSummary = this.patrolSummary + this.gm.currentOrdersLong;
        //Subheader - GRT Summary
        if (this.gm.shipsSunkOnCurrentPatrol.length == 1) {
            this.patrolSummary = this.patrolSummary + "1 ship sunk for " + this.getTotalGRT() + " GRT <br>";
        }
        else if (this.gm.shipsSunkOnCurrentPatrol.length > 1) {
            this.patrolSummary = this.patrolSummary + this.gm.shipsSunkOnCurrentPatrol.length.toString() +  " ships sunk totaling " + this.getTotalGRT() + " GRT <br>";
        }
    }

    addLastEncounter(enc) {
        this.currentDay = this.currentDay + d6Roll();
        var lineEntry = "<p>Day " + this.currentDay.toString() + "- ";

        if (enc.encounterType == "No Encounter") {
            if (this.gm.patrol.patrolArray[this.gm.currentBox] == "Transit") {
                lineEntry = lineEntry + "Uneventful transit"
            }
            else if (this.gm.patrol.patrolArray[this.gm.currentBox] == "Mission") {
                //TODO
                lineEntry = lineEntry + "Successfully TBD--TODO"
            }
            else {
                lineEntry = lineEntry + "Patrolled area - no ships found.";
            }
        }
        //If encounter is a ship / attack encounter
        else if (enc.encounterType.includes("Ship") || enc.encounterType == "Convoy" || enc.encounterType.includes("Tanker")) {
            if (enc.encounterType == "Convoy") {
                lineEntry = lineEntry + "Encountered convoy; "
            }
            else if (enc.encounterType == "Ship") {
                lineEntry = lineEntry + "Encountered lone ship; "
            }
            else {
                lineEntry = lineEntry + "Encountered ships; "
            }

            //Results of attack
            if (enc.shipsSunk.length == 0) {
                lineEntry = "Unable to sink any targets. "
            }
            else {
                //sunk any ships
                var sunkText = "Sunk ";
                for (let i = 0; i < enc.shipsSunk.length; i++) {
                    sunkText = sunkText + enc.shipsSunk[i].getName() + ", " + enc.shipsSunk[i].getGRT() + "GRT";
                    if (i != enc.shipsSunk.length - 1) {
                        sunkText = sunkText + ", ";
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
                    lineEntry = lineEntry + "Evaded detection."
                }
            }
        }
        else {
            lineEntry = lineEntry + "unknown enc";
        }

        this.lineEntry = this.lineEntry + "</p>"

        this.patrolSummary = this.patrolSummary + lineEntry;
    }

    //Gets current GRT sunk on this patrol
    getTotalGRT() {
        for (let i = 0; i < this.gm.shipsSunkOnCurrentPatrol.length; i++) {
            console.log("Adding");
            this.totalGRT = this.totalGRT + this.gm.shipsSunkOnCurrentPatrol[i].getGRT();
        }

        return this.totalGRT.toString();
    }

    //No encounter for transit
    noEncounter() {

    }
}