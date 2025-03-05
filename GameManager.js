class GameManager{
    constructor(tv){

        this.tv = tv;
        this.sub = null;
        this.eventResolved = true;
        this.statusResolved = true;
        this.subEventResolved = true;

        this.kmdt = "";
        this.id = "";
        this.month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        this.date_month = 8;
        this.date_year = 1939;
        this.rankLong = ["Oberleutnant zur See", "Kapitan-leutnant", "Korvetten-kapitan", "Fregatten-kapitan", "Kapitan zur See"];
        this.rank = ["OLt zS", "KptLt", "KKpt", "FFKpt", "KptzS"];
        this.awardName = ["", "Knight's Cross", "Knight's Cross with Oakleaves", "Knight's Cross with Oakleaves and Swords",
                            "Knight's Cross with Oakleaves, Swords and Diamonds"];
        this.monthsSinceLastPromotionCheck = 0;     //how many months since last promotion roll
        this.shipsSunkSinceLastPromotionCheck= 0;
        this.knightsCrossSinceLastPromotionCheck = 0;
        this.unsuccessfulPatrolsSinceLastPromotionCheck = 0;
        this.capitalShipsSunkSinceLastKnightsCross = 0;
        this.monthOfLastKnightsCrossAward = -1;
        this.yearOfLastKnightsCrossAward = -1;
        this.currentOrders = "";
        this.currentOrdersLong = "";
        this.patrol = new Patrol(this.tv, this);
        this.patrolling = false;
        this.patrolCount = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth",
                            "tenth", "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth",
                            "seventeenth", "eighteenth", "nineteenth", "twentieth", "twenty-first", "twenty-second",
                            "twenty-third", "twenty-fourth"];
        this.patrolNum = 0;
        this.missionComplete = false;
        this.unsuccessfulPatrolsInARow = 0;
        this.eligibleForNewUboat = false;
        this.lastPatrolWasUnsuccessful = false;
        this.randomEvent = false;
        this.superiorTorpedoes = false;
        this.halsUndBeinbruch = 0;
        this.weatherDuty = false;
        this.severeWeather = false;
        this.eligibleForNewBoat = false;
        this.abortingPatrol = false;
        this.extraStep = 0;             //is -1 if aborting with diesel inop which forces an extra encounter every box
        this.contFromAbort = false;     //flag used to skip over second encounter roll for the very first time after aborting only 
        this.permMedPost = false;
        this.permArcPost = false;
        this.francePost = false
        this.patrolArray = [];
        this.currentBox = 0;
        this.shipsSunk = [];
        this.shipsSunkOnCurrentPatrol = [];
        this.logBook = [];
        this.pastSubs = [];
        this.adminMode = false;

        //------------Stat keeping
        this.successfulPatrols = 0;
        this.unsuccessfulPatrols = 0;
        this.damageDone = 0;
        this.hitsTaken = 0;
        this.randomEvents = 0;
        this.planesShotDown = 0;
        this.bestPatrolGRT = 0;
        this.numTimesDetected = 0;
        this.numPlaneEncounters = 0;    //Num of times plane encounters have been rolled
        this.numPlaneAttacks = 0;
        this.sailorsLost = 0;
        this.monthsInPort = 0;
        this.monthsAtSea = 0;
        
        this.popup2 = new GMPopup(this.tv, this);
        this.currentEncounter = null;
    }

    async startGame(name, num, subType){
        //begins game once player has selected sub from below HTML canvas
        this.kmdt = name;
        this.id = num;
        this.sub = new Uboat(subType, this.tv, this);
        if (this.tv.mainUI != null){
            this.tv.mainUI.subNum = this.getFullUboatID();
            this.tv.mainUI.rank = this.rank[this.sub.crew_levels["Kommandant"]] + " " + this.kmdt;
            this.tv.mainUI.date = this.getFullDate();
        }

        //Create first log
        var patrol = new PatrolLog(this.tv, this);
        this.logBook.push(patrol);

        //Popup to greet start of game
        if (this.id == 77 && this.kmdt == "kbb") {
            this.adminMode = true;
        }
        if (this.adminMode) { console.log("--ADMIN MODE--"); }
        this.setEventResolved(false);
        this.setDate();
        this.getStartingRank();
        this.popup2.startGameText(this.date_month, this.date_year);
        await until(_ => this.eventResolved == true);
        this.sub.torpedoResupply();        
    }

    /**
     * Sets EventResolved in gamemanager. False usually indicates a soft "pause"
     * @param {boolean} state 
     */
    setEventResolved(state) {
        this.eventResolved = state;
    }

    /**
     * Secondary event that soft "pauses" the game - only used by escort detection?
     * @param {boolean} state 
     */
    setSubEventResolved(state) {
        this.subEventResolved = state;
    }

    /**
     * 
     * @returns string "U-###"
     */
    getFullUboatID(){
        return "U-" + this.id;
    }

    /**
     * 
     * @returns String: Full date in Mon - Year Format (Jan - 1939)
     */
    getFullDate(){
        return this.month[this.date_month] + " - " + this.date_year;
    }

    getYear(){
        return this.date_year;
    }

    getMonth() {
        return this.date_month;
    }

    getLRankAndName(){
        return this.rankLong[this.sub.crew_levels["Kommandant"]] + " " + this.kmdt;
    }

    getRankAndName(){
        return this.rank[this.sub.crew_levels["Kommandant"]] + " " + this.kmdt;
    }

    /**
     * Gets current GRT sunk on this patrol
     * @returns STRING of # of GRT sunk, WITH commas: "7,400"
     */
    getPatrolTotalGRT() {
        let newTotalGRT = 0;
        for (let i = 0; i < this.shipsSunkOnCurrentPatrol.length; i++) {
            newTotalGRT += this.shipsSunkOnCurrentPatrol[i].getGRTInt();
        }
        var stringReturn = newTotalGRT.toLocaleString();
        return stringReturn;
    }

    /**
     * Gets current GRT sunk for entire career
     * @returns STRING of # of GRT sunk, WITH commans: "2,700"
     */
    getTotalGRT() {
        let newTotalGRT = 0;
        for (let i = 0; i < this.shipsSunk.length; i++) {
            newTotalGRT += this.shipsSunk[i].getGRTInt();
        }
        var stringReturn = newTotalGRT.toLocaleString();
        return stringReturn;
    }

    /**
     * Determines the starting rank of the player
     */
    getStartingRank(){
        if ((this.sub.getType().includes("IX"))) {
            this.sub.crew_levels["Kommandant"] = 1;
        }
        else{
            roll = d6Roll();
            switch (this.date_year){
                case 1939:
                    this.sub.crew_levels["Kommandant"] = 1;
                    break;
                case 1940:
                    if (roll >= 3){
                        this.sub.crew_levels["Kommandant"] = 1;
                    }
                    else{
                        this.sub.crew_levels["Kommandant"] = 0;
                    }
                    break;
                case 1941:
                    if (roll >= 4){
                        this.sub.crew_levels["Kommandant"] = 1;
                    }
                    else{
                        this.sub.crew_levels["Kommandant"] = 0;
                    }
                    break;
                case 1942:
                case 1943:
                    if (roll >= 6){
                        this.sub.crew_levels["Kommandant"] = 1;
                    }
                    else{
                        this.sub.crew_levels["Kommandant"] = 0;
                    }
                    break;
                default:
                    console.log("Error getting starting rank");
            }
        }
    }

    /**
     * Sets date and other settings based on sub selection for game start
     */
    setDate(){
        switch (this.sub.getType()){
            case "VIIA":
                this.date_month = 8;
                this.date_year = 1939;
                break;
            case "VIIB":
                this.date_month = 8;
                this.date_year = 1939;
                break;
            case "IXA":
                this.date_month = 8;
                this.date_year = 1939;
                break;
            case "IXB":
                this.date_month = 3;
                this.date_year = 1940;
                break;
            case "IXC":
                this.date_month = 4;
                this.date_year = 1941;
                this.francePost = true;
                break;
            case "VIIC":
                this.date_month = 9;
                this.date_year = 1940;
                this.francePost = true;
                break;
            case "VIID":
                this.date_month = 0;
                this.date_year = 1942;
                this.francePost = true;
                break;
        }
    }

    newPatrol(){
        //gets new patrol, validates orders etc
        this.patrol.getPatrol();
    }

    setCurrentOrdersLong(){
        switch (this.currentOrders){
            case "British Isles":
            case "Mediterranean":
            case "Artic":
            case "Caribbean":
                this.currentOrdersLong = "Patrol the " + this.currentOrders;
                break;
            case "West African Coast":
            case "Spanish Coast":
                this.currentOrdersLong = "Patrol off the " + this.currentOrders;
                break;
            case "Norway":
                this.currentOrdersLong = "Patrol off " + this.currentOrders;
                break;
            case "Atlantic":
                this.currentOrdersLong = "Patrol the Mid-Atlantic";
                break;
            case "North America":
                this.currentOrdersLong = "Patrol the NA Station";
                break;
            case "British Isles (Minelaying)":
                this.currentOrdersLong = "Minelay off British Isles"
                break;
            case "British Isles (Abwehr Agent Delivery)":
                this.currentOrdersLong = "Deliver Agent to Britain"
                break;
            case "Atlantic (Wolfpack)":
                this.currentOrdersLong = "Wolfpack Patrol the Mid-Atlantic";
                break;
            case "North America (Abwehr Agent Delivery)":
                this.currentOrdersLong = "Deliver Agent to USA"
                break;
            default:
                console.log("Error getting Long orders version.");
                break;
        }
    }

    async ordersPopup(onlyUnique, isPicking){
        this.setEventResolved(false);
        const ordersPopUp = new OrdersPopup(this.tv, this, onlyUnique, isPicking);
        await until(_ => this.eventResolved == true);

        //Check for arctic permanent assignments
        if (this.currentOrders == "Arctic"){
            let articAssignRoll = d6Roll();

            if (articAssignRoll <= 3) {
                this.permArcPost = true;
                this.setEventResolved(false);
                this.popup2.arcticAssignmentPopup();
                await until(_ => this.eventResolved == true);
            }
        }

        this.tv.changeScene("NoEnc", "Day", null, false);
    }

    beginPatrol() {
        this.patrolling = true;
        this.patrolNum++;
        var patrol = new PatrolLog(this.tv, this);      
        this.logBook.push(patrol);
        this.currentBox = 0;
        this.advancePatrol();
    }

    /**
     * Patrol sequence to go through one patrol box
     */
    async advancePatrol() {
    
        //close previous box and move to next square
        if (this.currentBox > 0 && this.currentBox != this.patrol.getPatrolLength()) {
            this.currentEncounter.closeWindows();
        }

        //End patrol if advance was clicked while boat is on the final box
        if (this.currentBox == this.patrol.getPatrolLength()) {
            this.endPatrol();
            return;
        }

        //Advance box
        this.currentBox++;
        this.currentBox = this.currentBox + this.extraStep;
        console.log("Patrol Advance---------- step #" + this.currentBox);

        //if doctor is SW or KIA, see if any other injured crew members die (each patrol box, before encounter)
        if (!this.sub.isCrewmanFunctional("Doctor")){
            //check if any hurt crewmen
            let vitals = this.sub.checkVitals();
            if (vitals != "") {
                this.setEventResolved(false);
                this.popup2.deathKIAPopup(vitals);
                await until(_ => this.eventResolved == true);
            }
        }

        //get the current box name of this patrol (i.e. "Transit", "Mission", "Atlantic", etc)
        var currentBoxName = this.patrol.patrolArray[this.currentBox + this.extraStep];

        // check if on weather duty or severe weather random events (skips current box)
        if (this.weatherDuty){
            //TODO: weather
            console.log("TO DO - Deal with weather duty");
        }
        if (this.severeWeather) {
            //TODO: weather
            console.log("TO DO - Deal with severe weather");
        }

        let roll = -1;
        //Check admin mode
        if (this.adminMode) {
            this.eventResolved = false;
            let dicePicker = new AdminPopup(this.tv, this, "Get Encounter Type (E1)");
            await until(_ => this.eventResolved == true);
            roll = parseInt(dicePicker.getChoice());
        }

        //get current encounter (IE noEncounter, encounterAttackConvoy)
        var currentEncounterType = this.patrol.getEncounterType(currentBoxName, this.getYear(), this.randomEvent, roll);
        
        console.log("Current Encounter: " + currentEncounterType);

        this.currentEncounter = new Encounter(this.tv, this, this.patrol, this.sub, currentEncounterType, currentBoxName, null);
        await until(_ => this.tv.isInEncounter == false);
        console.log("End Encounter");

        //change extra step to force another encounter in the same box
        if (this.sub.dieselsInop() == 1 && this.contFromAbort) {
            if (this.extraStep == 0) {
                this.extraStep = -1;
            }
            else {
                this.extraStep = 0;
            }
        }

        if (this.abortingPatrol && !this.contFromAbort) {
            this.contFromAbort = true;
        }
    }

    /**
     * Sets aborting patrol to true and immediately changes currentBox to nearest transit, if not in one already.
     * If at start of patrol (first 1-4 transit boxes), places boat in the corresponding box at the end of the patrol.
     */
    async abortPatrol() {
        this.abortingPatrol = true;

        let patrolLength = this.patrol.getPatrolLength();
        let transitSteps = 2;
        let stepsToEnd = patrolLength - this.currentBox;        // Num of steps to get to very last box
        if (this.patrol.NAorders || this.patrol.WAfricanCoast) { 
            transitSteps = 4;
        }

        //First check if already in a transit area when attempting to abort
        if (this.patrol.patrolArray[this.currentBox] == "Transit" || this.patrol.patrolArray[this.currentBox] == "Bay of Biscay") {
            //Check if in the first half of the transit boxes
            if (stepsToEnd > patrolLength / 2) {
                let newStepsToEnd = patrolLength - stepsToEnd;
                this.currentBox = patrolLength - newStepsToEnd + 1;         //Need to add extra step
            }
            //else (already in transit box at end of patrol), nothing happens, continue moving towards port / end
        }
        else {  //Otherwise, (when in the middle of patrol)
            this.currentBox = patrolLength - transitSteps;
        }

        //will need a flag somwhere in here for IX boats whether they burn a second month or not (abort before halfway)

        this.subEventResolved = false;
        this.popup2.abortPatrolPopup();
        await until(_ => this.subEventResolved == true);
    }

    async recovery() {
        this.setEventResolved(false);
        this.popup2.abortTowedBackPopup();
        await until(_ => this.eventResolved == true);
        this.currentBox = this.patrol.getPatrolLength();
        this.endPatrol();
    }

    async endPatrol() {
        if (this.currentBox > 0) {
            this.logBook[this.patrolNum].getPatrolHeader();
            this.currentEncounter.closeWindows();            
        }

        this.tv.changeScene("Port", "Day", null, false);
        this.patrolling = false;
        this.eventResolved = false;
        this.popup2.endPatrolPopup();
        await until(_ => this.eventResolved == true);
    }
}