class GameManager{
    constructor(tv){

        this.gameInit = true; //Used during startup, up until startGame() finishes
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

        this.currentOrders = "";
        this.currentOrdersLong = "";
        //this.patrol = null;
        this.newPatrol();
        this.patrols = []; // Array of all patrol objects for record keeping if needed
        this.patrolling = false;
        this.patrolCount = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth",
                            "tenth", "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth",
                            "seventeenth", "eighteenth", "nineteenth", "twentieth", "twenty-first", "twenty-second",
                            "twenty-third", "twenty-fourth"];
        this.patrolNum = 0;
        this.missionComplete = false;
        this.unsuccessfulPatrolsInARow = 0;
        this.lastPatrolWasUnsuccessful = false;
        this.abortingPatrol = false;
        this.extraStep = 0;             //is -1 if aborting with diesel inop which forces an extra encounter every box
        this.contFromAbort = false;     //flag used to skip over second encounter roll for the very first time after aborting only 
        this.permMedPost = false;
        this.permArcPost = false;
        this.francePost = false
        this.currentBox = 0;
        this.capitalShipsSunk = 0;
        this.shipsSunk = [];
        this.shipsSunkOnCurrentPatrol = [];
        this.logBook = [];
        this.pastSubs = [];
        this.adminMode = false;
        this.gameOverEnc = null;        //To be updated when gameover occurs
        this.gameOverCause = "";        //To be updated when gameover occurs

        //------------For Awards and Rank (and reassignment/upgrade)
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
        this.uboatWarBadgeLevel = 0;   //0 = none, 1 = War Badge, 2 = War Badge w/ diamonds
        this.uboatFrontClaspLevel = 0; //0 = none, 1 = black, 2 = silver, 3 = gold
        this.woundBadgeLevel = 0;      //0 = none, 1 = black, 2 = silver, 3 = gold
        this.germanCrossLevel = 0;     //0 = none, 1 = black, 2 = silver, 3 = gold
        this.uboatUpgrade = false;      //If eligible for an upgrade
        this.uboatReassignment = false; //If required to be reassigned to a new boat (due to SW or too much damage to uboat)
        
        //------------For Random Event tracking
        this.randomEvent = false;
        this.superiorTorpedoes = false;
        this.halsUndBeinbruch = 0;
        this.weatherDuty = false;
        this.severeWeather = false;

        //------------Stat keeping
        this.successfulPatrols = 0;
        this.unsuccessfulPatrols = 0;
        this.totalGRTSunk = 0;
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
        var patrolLog = new PatrolLog(this.tv, this);
        this.logBook.push(patrolLog);

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
        this.gameInit = false;
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
        return this.month[this.date_month] + " - " + this.date_year;  //TODO: doublecheck if correct month
    }

    getYear(){
        return this.date_year;
    }

    /**
     * 
     * @returns month in number format
     */
    getMonth() {
        return this.date_month;
    }

    getMonthString(){
        return this.month[this.date_month];
    }

    /**
     * Advances time one month
     */
    advanceMonth() {
        this.date_month += 1;
        if (this.getMonth() > 11) {
            this.date_month = 0;
            this.date_year++;
        }

        //Update months at sea / in port
        if (this.patrolling) {
            this.monthsAtSea++;
        }
        else {
            this.monthsInPort++;
        }
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
     * Gets current GRT sunk for entire career.
     * Note: Changed from calculating each time.
     * @returns STRING or INT of # of GRT sunk, WITH commas: "2,700"
     */
    getTotalGRT(returnType) {
        //let newTotalGRT = 0;
        //for (let i = 0; i < this.shipsSunk.length; i++) {
        //    newTotalGRT += this.shipsSunk[i].getGRTInt();
        //}
        if (returnType == "String") {
            var stringReturn = this.totalGRTSunk.toLocaleString();
            return stringReturn;
        }
        else {
            return this.totalGRTSunk;
        }
        
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
        this.patrol = new Patrol(this.tv, this);
        if (!this.gameInit){
            this.patrol.getPatrol();
        }
    }

    setCurrentOrdersLong(){
        switch (this.currentOrders){
            case "British Isles":
            case "Mediterranean":
            case "Arctic":
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
                this.currentOrdersLong = "Patrol off the NA Coast";
                break;
            case "British Isles (Minelaying)":
                this.currentOrdersLong = "Minelay off British Isles"
                break;
            case "British Isles (Abwehr Agent Delivery)":
                this.currentOrdersLong = "Deliver Agent to Britain"
                break;
            case "Atlantic (Wolfpack)":
                this.currentOrdersLong = "Wolfpack Patrol (Mid-Atlantic)";
                break;
            case "North America (Abwehr Agent Delivery)":
                this.currentOrdersLong = "Deliver Agent to NA"
                break;
            default:
                console.log("Error getting Long orders version for: " + this.currentOrders);
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
        this.patrols.push(this.patrol);
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
        if (this.currentBox == this.patrol.getPatrolLength() && this.extraStep == 0) {
            this.currentEncounter.closeWindows();
            this.endPatrol();
            return;
        }

        //Advance box
        this.currentBox++;
        this.currentBox = this.currentBox + this.extraStep;
        console.log("Patrol Advance---------- step #" + this.currentBox);

        //Check if type IX_ or VIID and halfway through patrol in order to account for 2 month long patrols
        if ((this.sub.getType().includes("IX") || this.sub.getType() == "VIID") && this.currentBox >= (this.patrol.getPatrolLength() / 2)){
            //Check to make sure extra month is not already accounted for
            if (this.patrol.startMonth == this.getMonth()) {
                this.advanceMonth();
            }
        } 

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

        //TODO will need a flag somwhere in here for IX boats whether they burn a second month or not (abort before halfway)

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

        //repair / refit sub first
        var refitResults = this.sub.refit();
        var hospitalResults = this.sub.hospital();

        //if a new uboat is called for (due to excessive damage or SW on KMDT)
        if (this.uboatReassignment) {
            console.log("TODO: popup required for reassignment");
            console.log("TODO: reassign to new uboat, create new uboat object");
        }
        else {
            this.popup2.repairAndRecovery(refitResults, hospitalResults);
        }
        await until(_ => this.eventResolved == true);

        //Advance time
        this.advanceMonth();
    }

    // Called from game over popup to update game manager states
    gameOverTrigger(enc, cause) {
        this.gameOverEnc = enc;
        this.gameOverCause = cause;
        //this.tv.changeScene("NoEnc", "Day", null, false); Need gameover screen / art
    }

    getPastSubs() {
        var toReturn = "";
        for (let i = 0; i < this.pastSubs.length; i++) {
            toReturn += this.pastSubs[i];
            if (i < this.pastSubs.length - 1) {
                toReturn += ", ";
            }
        }
        return toReturn;
    }

    getSurvivalStatus() {
        //AFTER June 1943 (patrols can begin in June 1943)
        if (this.getYear() >= 1943 && this.getMonth() > 5) {
            return "Survived War"; //TODO: needs specific survival info
        }
        else {
            return "KIA"; // TODO: needs specific survival info (captured etc)
        }
    }

    fetch() {
        const gameData = {
            rank: this.rank[this.sub.crew_levels["Kommandant"]],
            captain_name: this.kmdt,
            uboat_number: this.getFullUboatID(),
            uboat_type: this.sub.getType(),
            previous_uboats: this.getPastSubs(),

            patrols: this.patrolNum,
            tonnage_sunk: this.gm.getTotalGRT("Int"),
            ships_sunk: this.shipsSunk.length,
            warships_sunk: this.capitalShipsSunk,
            num_planes_shot_down: this.planesShotDown,

            survival_status: this.getSurvivalStatus(),
            end_month: this.getMonth() + 1,
            end_year: this.getYear(),
            game_over_encounter: "N/A",
            game_over_cause: this.gameOverCause,

            knights_cross: this.sub.knightsCross,
            war_badge: this.uboatWarBadgeLevel,
            front_clasp: this.uboatFrontClaspLevel,
            wound_badge: this.woundBadgeLevel,
            german_cross: this.germanCrossLevel,

            times_detected: this.numTimesDetected,
            damage_done: this.damageDone,
            hits_taken: this.hitsTaken,
            random_events: this.randomEvents,
            sailors_lost: this.sailorsLost,
            months_at_sea: this.monthsAtSea,
            months_in_port: this.monthsInPort,
            successful_patrols: this.successfulPatrols,
            unsuccessful_patrols: this.unsuccessfulPatrols,
            num_plane_encounters: this.numPlaneEncounters,
            num_plane_attacks: this.numPlaneAttacks
        };

        // Send to backend
        fetch('http://hunters.local/api/submit_score.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gameData)
        })
        .then(response => response.json())
        .then(result => {
            console.log("Submission result:", result);
        })
        .catch(error => {
            console.error("Error submitting game data:", error);
        });

            }
}