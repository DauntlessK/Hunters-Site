class GameManager{
    constructor(tv){

        this.gameInit = true; //Used during startup, up until startGame() finishes
        this.tv = tv;
        this.sub = null;
        this.eventResolved = true;
        this.statusResolved = true;
        this.awardsResolved = true;
        this.subEventResolved = true;
        this.play_id = null;

        this.kmdt = "";
        this.id = "";
        this.month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        this.date_month = 8;
        this.date_year = 1939;

        this.currentOrders = "";
        this.currentOrdersLong = "";
        this.newPatrol();
        this.patrols = [];          // Array of all patrol objects for record keeping if needed
        this.patrols.push(null);    //adds null patrol to skip over zeroth patrol
        this.patrolling = false;
        this.patrolCount = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth",
                            "tenth", "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth",
                            "seventeenth", "eighteenth", "nineteenth", "twentieth", "twenty-first", "twenty-second",
                            "twenty-third", "twenty-fourth", "twenty-fifth", "twenty-sixth", "twenty-seventh",
                            "twenty-eighth", "twenty-ninth", "thirtieth"];
        this.patrolNum = 0;
        this.missionComplete = false;
        this.unsuccessfulPatrolsInARow = 0;
        this.lastPatrolWasUnsuccessful = false;
        this.abortingPatrol = false;
        this.extraStep = 0;             //is -1 if aborting with diesel inop which forces an extra encounter every box
        this.contFromAbort = false;     //flag used to skip over second encounter roll for the very first time after aborting only 
        this.permMedPost = false;
        this.permArcPost = false;
        this.francePost = false;
        this.currentBox = 0;
        this.capitalShipsSunk = 0;
        this.shipsSunk = [];
        this.shipsSunkOnCurrentPatrol = [];
        this.logBook = [];
        this.logBook.push(null);    //adds null patrollog to skip over zeroth patrol
        this.pastSubs = [];
        this.adminMode = false;
        this.gameOverEnc = null;        //To be updated when gameover occurs
        this.gameOverCause = "";        //To be updated when gameover occurs
        this.survivalStatus = "";       //To be updated when gameover occurs

        //------------For Awards and Rank (and reassignment/upgrade)
        this.rankLong = ["Oberleutnant zur See", "Kapitan-leutnant", "Korvetten-kapitan", "Fregatten-kapitan", "Kapitan zur See"];
        this.rank = ["OLt zS", "KptLt", "KKpt", "FFKpt", "KptzS"];
        this.awardName = ["", "Knight's Cross", "Knight's Cross with Oakleaves", "Knight's Cross with Oakleaves and Swords",
                            "Knight's Cross with Oakleaves, Swords and Diamonds"];
        //this.monthsSinceLastPromotionCheck = 0;     //how many months since last promotion roll
        this.numPromotionChecks = 0;
        this.shipsSunkSinceLastPromotionCheck= 0;
        this.knightsCrossSinceLastPromotionCheck = 0;
        this.unsuccessfulPatrolsSinceLastPromotionCheck = 0;
        this.capitalShipsSunkSinceLastKnightsCross = 0;
        this.monthOfLastKnightsCrossAward = -1;
        this.yearOfLastKnightsCrossAward = -1;
        this.checkedForCrewLevelUp = false;     //Changes to true when it is checked when success patrols hits 3/6/9 etc. 
                                                //Then flips to false after another (3+1 or 6+1, etc) successful patrol is made.
        this.uboatWarBadgeLevel = 0;   //0 = none, 1 = War Badge, 2 = War Badge w/ diamonds
        this.uboatFrontClaspLevel = 0; //0 = none, 1 = black, 2 = silver, 3 = gold
        this.woundBadgeLevel = 0;      //0 = none, 1 = black, 2 = silver, 3 = gold
        this.germanCrossLevel = 0;     //0 = none, 1 = black, 2 = silver, 3 = gold
        this.uboatUpgrade = true;      //If eligible for an upgrade
        this.uboatReassignment = false; //If required to be reassigned to a new boat (due to SW or too much damage to uboat)
        this.uboatUpgradeChoice = false; //If player picked upgrade during awards
        this.numPatrolsKMDTWounded = 0;
        this.KMDTWasWoundedThisPatrol = false;

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
        this.mostShipsSunkOnPatrol = 0;
        this.numTimesDetected = 0;
        this.numPlaneEncounters = 0;    //Num of times plane encounters have been rolled
        this.numPlaneAttacks = 0;
        this.sailorsLost = 0;
        this.monthsInPort = 0;
        this.monthsAtSea = 0;
        this.firstUboatType = "";
        
        this.gameManagerPopup = new GMPopup(this.tv, this);
        this.currentEncounter = null;
    }

    async startGame(name, num, subType){
        //begins game once player has selected sub from below HTML canvas
        this.kmdt = name;
        this.id = num;
        this.sub = new Uboat(subType, this.tv, this, null, 0);
        if (this.tv.mainUI != null){
            this.tv.mainUI.subNum = this.getFullUboatID();
            this.tv.mainUI.rank = this.rank[this.sub.crew_levels["Kommandant"]] + " " + this.kmdt;
            this.tv.mainUI.date = this.getFullDate();
        }

        this.firstUboatType = this.sub.getType();

        //Popup to greet start of game
        if (this.id == 77 && this.kmdt == "kbb") {
            this.adminMode = true;
        }
        if (this.adminMode) { console.log("--ADMIN MODE--"); }


        //Submit start to database and get play_id
        //""/Hunters_beta/api/start_play.php""
        //"http://hunters.local/api/start_play.php"
        fetch("/Hunters_beta/api/start_play.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                captain_name: this.kmdt,
                uboat_number: this.getFullUboatID(),
                uboat_type: this.sub.getType()
            })
        })
        .then(r => r.json())
        .then(data => {
            this.play_id = data.play_id;  // store it!
        });

        this.setEventResolved(false);
        this.setDate();
        this.getStartingRank();
        this.gameManagerPopup.startGameText(this.date_month, this.date_year);
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

    getCurrentPatrol() {
        return this.patrols[this.patrolNum];
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
            this.isWarOver();       //only triggered (checked) when in port
        }

        //update france post if applicable
        if (!this.francePost && (this.date_month >= 6 && this.date_year >= 1940)) {
            this.francePost = true;
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
    getPatrolTotalGRT(returnType) {
        let newTotalGRT = 0;
        for (let i = 0; i < this.shipsSunkOnCurrentPatrol.length; i++) {
            newTotalGRT += this.shipsSunkOnCurrentPatrol[i].getGRTInt();
        }
        if (returnType == "String") {
            var stringReturn = newTotalGRT.toLocaleString();
            return stringReturn;
        }
        else{
            return newTotalGRT;
        }
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

    /**
     * Gets the latest available U-boat type for upgrade/reassignment
     * @returns STRING of U-boat type (e.g. "VIIC")
     */
    getLatestAvailableUboatType() {
        if (this.sub.getType().includes("VII")) {
            if (this.date_month >= 0 && this.date_year == 1942) {
                return "VIID";
            }
            else if (this.date_month >= 9 && this.date_year >= 1940) {
                return "VIIC";
            }
            else {
                return "VIIB";
            }
        }
        else {
            if (this.date_month >= 4 && this.date_year >= 1941) {
                return "IXC";
            }
            else if (this.date_month >= 3 && this.date_year >= 1940) {
                return "IXB";
            }
            else {
                return "IXA";
            }   
        }
    }

    /**
     * Gets array of newer uboat types available for upgrade. Includes current type.
     * @returns array of newer uboats the player would be able to select to upgrade to
     */
    getNewerUboatTypes() {
        let newerTypes = [];
        let currentType = this.sub.getType();
        latestAvailable = this.getLatestAvailableUboatType();

        if (currentType == latestAvailable) {
            newerTypes.push(currentType);
            return newerTypes;
        }
        else {
            if (currentType.includes("VII")) {
                newerTypes = ["VIIB", "VIIC", "VIID"];

                if (currentType == "VIIC" || currentType == "VIID") {
                    newerTypes.shift();
                }
                if (currentType == "VIID") {
                    newerTypes.shift();
                }
                return newerTypes;
            }
            else {
                newerTypes = ["IXB", "IXC"];
                if (currentType == "IXC") {
                    newerTypes.shift();
                }
                return newerTypes;
            }
        }
    }

    newPatrol(){
        //gets new patrol, validates orders etc
        this.patrol = new Patrol(this.tv, this);
        if (!this.gameInit){
            this.patrol.getPatrol();
        }
    }

    async ordersPopup(onlyUnique, isPicking){
        this.setEventResolved(false);
        const ordersPopUp = new OrdersPopup(this.tv, this, onlyUnique, isPicking);
        await until(_ => this.eventResolved == true);

        //Check for arctic permanent assignments
        if (this.currentOrders == "Arctic" && this.permArcPost == false) {
            let articAssignRoll = d6Roll();

            if (articAssignRoll <= 3) {
                this.permArcPost = true;
                this.setEventResolved(false);
                this.gameManagerPopup.arcticAssignmentPopup();
                await until(_ => this.eventResolved == true);
            }
        }

        this.tv.changeScene("NoEnc", "Day", null, false);
    }

    beginPatrol() {
        this.patrolling = true;
        this.patrolNum++;

        //Advance month if not first patrol
        if (this.patrolNum > 1) {
            this.advanceMonth();
        }
        else {
            //First patrol does not advanceMonth() but still needs to add a month at sea
            this.monthsAtSea++;
        }

        var currentLog = new PatrolLog(this.tv, this);      
        this.logBook.push(currentLog);

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
        else if (this.extraStep != 1 && this.currentBox > 0) {
            this.currentEncounter.closeWindows();
        }

        //If too late to abort patrol, disable abort button
        if ((this.currentOrders.includes("North America") || this.currentOrders.includes("Caribbean")) && this.currentBox >= this.patrol.getPatrolLength() - 4) {
            this.tv.mainUI.abortButton.changeState("Disabled");
        }
        else if (this.currentBox >= this.patrol.getPatrolLength() - 2) {
            this.tv.mainUI.abortButton.changeState("Disabled");
        }

        //Advance box
        this.currentBox++;
        this.currentBox = this.currentBox + this.extraStep;
        console.log("Patrol Advance---------- step #" + this.currentBox);

        //Check if type IX_ or VIID and halfway through patrol in order to account for 2 month long patrols
        //Do not account for extra month if aborting patrol
        if ((this.sub.getType().includes("IX") || this.sub.getType() == "VIID") && this.currentBox >= (this.patrol.getPatrolLength() / 2)
             && this.abortingPatrol == false) {
            //Check to make sure extra month is not already accounted for
            if (this.patrol.startMonth == this.getMonth()) {
                console.log("Advancing extra month for IX/VIID half-patrol");
                this.advanceMonth();
            }
        } 

        //if doctor is SW or KIA, see if any other injured crew members die (each patrol box, before encounter)
        if (!this.sub.isCrewmanFunctional("Doctor")){
            //check if any hurt crewmen
            let vitals = this.sub.checkVitals();
            if (vitals != "") {
                this.setEventResolved(false);
                this.gameManagerPopup.deathKIAPopup(vitals);
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

        //get current encounter (IE noEncounter, encounterAttackConvoy, Random Event, etc)
        var currentEncounterType = this.patrol.getEncounterType(currentBoxName, this.getYear(), this.randomEvent, roll);
        
        console.log("Current Encounter: " + currentEncounterType);

/*      if (currentEncounterType == "Random Event") {
            this.randomEvent = true;
        }
        else {
            this.currentEncounter = new Encounter(this.tv, this, this.patrol, this.sub, currentEncounterType, currentBoxName, null);
            await until(_ => this.tv.isInEncounter == false);
            console.log("End Encounter");
        } */

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

    async abortPatrolPrompt() {
        this.setEventResolved(false);
        this.gameManagerPopup.voluntaryAbortPatrolPopup();
        await until(_ => this.eventResolved == true);
    }

    /**
     * Sets aborting patrol to true and immediately changes currentBox to nearest transit, if not in one already.
     * If at start of patrol (first 1-4 transit boxes), places boat in the corresponding box at the end of the patrol.
     */
    async abortPatrol() {
        this.abortingPatrol = true;
        this.tv.mainUI.abortButton.changeState("Disabled");

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
        this.gameManagerPopup.abortPatrolPopup();
        await until(_ => this.subEventResolved == true);
    }

    async recovery() {
        this.setEventResolved(false);
        this.gameManagerPopup.abortTowedBackPopup();
        await until(_ => this.eventResolved == true);
        this.currentBox = this.patrol.getPatrolLength();
        this.endPatrol();
    }

    async endPatrol() {
        console.log("Ending Patrol");

        if (this.currentBox > 0) {
            this.logBook[this.patrolNum].getPatrolHeader();
            this.currentEncounter.closeWindows();            
        }

        this.tv.changeScene("Port", "Day", null, false);
        this.patrolling = false;

        //Show end of patrol popup==================
        this.eventResolved = false;
        this.gameManagerPopup.endPatrolPopup();
        await until(_ => this.eventResolved == true);

        //repair / refit sub - establishes monthsNeededForRefit
        var refitResults = this.sub.refit();
        var hospitalResults = this.sub.hospital();

        //Update successful / unsuccessful patrol stats
        if (this.missionComplete) {
            this.successfulPatrols++;
            this.unsuccessfulPatrolsInARow = 0;
            this.lastPatrolWasUnsuccessful = false;
            if (this.successfulPatrols % 3 == 1) {
                this.checkedForCrewLevelUp = false;   
            }
        }
        else {
            this.unsuccessfulPatrols++;
            this.unsuccessfulPatrolsInARow++;
            this.lastPatrolWasUnsuccessful = true;
            this.unsuccessfulPatrolsSinceLastPromotionCheck++;
        }

        //Update if this was most successful patrol
        if (this.getPatrolTotalGRT("Int") > this.bestPatrolGRT) {
            this.bestPatrolGRT = this.getPatrolTotalGRT("Int");
        }
        //Update if this was the most ships sunk on a patrol
        if (this.shipsSunkOnCurrentPatrol.length > this.mostShipsSunkOnPatrol) {
            this.mostShipsSunkOnPatrol = this.shipsSunkOnCurrentPatrol.length;
        }

        //TODO: Promotion and Award checks here?===================
        this.awardsResolved = false;
        let awardsPopup = new AwardsPopup(this.tv, this);
        await until(_ => this.awardsResolved == true);

        //Reset various flags
        this.abortingPatrol = false;
        this.missionComplete = false;
        this.shipsSunkOnCurrentPatrol = [];
        this.contFromAbort = false;
        this.extraStep = 0;
        this.KMDTWasWoundedThisPatrol = false;
        this.tv.mainUI.abortButton.changeState("Active");

        this.isWarOver();

        this.eventResolved = false;

        //Either display reassignment/upgrade popup or refit/recovery popup
        if (this.uboatReassignment || this.uboatUpgradeChoice) {

            //check if reassignment due to SW on KMDT
            //if not, new uboat reassignment retains crew levels and only 1 month for refit
            let swReassignment = false;
            if (hospitalResults.includes("reassigned")) {
                swReassignment = true;
            }
            else {
                this.sub.monthsNeededForRefit = 1;
            }
            
            //get previous sub object's number then add to previous subs array
            this.pastSubs.push(this.getFullUboatID());

            //Show reassignment popup========================== 
            this.eventResolved = false;
            const reassignmentPopup = new ReassignmentPopup(this.tv, this, swReassignment, this.uboatUpgradeChoice, this.uboatUpgrade);

            this.uboatReassignment = false;
            if (this.uboatUpgradeChoice) {
                this.uboatUpgradeChoice = false;
            }
        } 
        else {
            //Refit and Recovery popup=========================
            let randr = new RefitAndRecovery(this.tv, this, this.sub.monthsNeededForRefit, refitResults, hospitalResults);
        }
        await until(_ => this.eventResolved == true);

        this.sub.torpedoResupply();
        //force update of torpedo buttons
        for (let i = 1; i < 7; i++) {
            this.tv.mainUI.tubeButtonArray[i].getLatestState();
        }

        //Advance time X months based on repair and hospital results
        for (let i = 0; i < this.sub.monthsNeededForRefit; i++) {
            this.advanceMonth();
        }

        this.sub.monthsNeededForRefit = 0; //Reset back to 0 after use
    }

    // Called from game over popup to update game manager states
    gameOverTrigger(enc, cause) {
        this.gameOverEnc = enc;
        this.gameOverCause = cause;
        //this.tv.changeScene("NoEnc", "Day", null, false); Need gameover screen / art
    }

    /**
     * Gets past subs commanded by player
     * @returns string of U-boat #s
     */
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

    /**
     * Checks if patrols can still be conducted.
     * @returns true if AFTER june 1943 which immediately triggers Game Over popup. False otherwise.
     */
    isWarOver() {
        if (this.getYear() >= 1943 && this.getMonth() > 5) {
            let cause = "War is over";
            let attacker = null;
            const goPopup = new GameOverPopup(this.tv, this, this.currentEncounter, cause, attacker);
        }
        return false;
    }

    /**
     * Sends final scores and stats to API to log for high scores.
     */
    fetch() {
        console.log("Submitting game data to backend...");

        const gameData = {
            play_id: this.play_id,
            rank: this.rank[this.sub.crew_levels["Kommandant"]],
            captain_name: this.kmdt,
            uboat_number: this.getFullUboatID(),
            uboat_type: this.sub.getType(),
            starting_uboat_type: this.firstUboatType,
            previous_uboats: this.getPastSubs(),

            patrols: this.patrolNum,
            tonnage_sunk: this.getTotalGRT("Int"),
            ships_sunk: this.shipsSunk.length,
            warships_sunk: this.capitalShipsSunk,
            num_planes_shot_down: this.planesShotDown,

            survival_status: this.survivalStatus,
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
        //"/Hunters_beta/api/submit_game.php"
        //'http://hunters.local/api/submit_game.php'
        fetch("/Hunters_beta/api/submit_game.php", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameData)
        })
        .then(response => response.text())
        .then(text => {
            console.log("RAW RESPONSE FROM SERVER:");
            console.log(text);
            try {
                console.log("Parsed JSON:", JSON.parse(text));
            } catch (err) {
                console.error("JSON parse error:", err);
            }
        })
        .catch(error => {
            console.error("Error submitting game data:", error);
        });

        return;
    }
}