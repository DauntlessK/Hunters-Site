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
        this.successfulPatrols = 0;
        this.unsuccessfulPatrols = 0;
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
        this.contFromAbort = false;     //flag used to skip over second encounter roll for the very first time after aborting only 
        this.permMedPost = false;
        this.permArcPost = false;
        this.francePost = false
        this.patrolArray = [];
        this.currentBox = 0;
        this.shipsSunk = [];
        this.planesShotDown = 0;
        this.shipsSunkOnCurrentPatrol = [];
        this.logBook = [];
        this.damageDone = 0;
        this.hitsTaken = 0;
        this.randomEvents = 0;
        this.pastSubs = [];
        this.adminMode = false;
        
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
    
        //close previous box and move to next square --- HERE ALSO UPDATE CURRENT PATROL LOG
        if (this.currentBox > 0) {
            this.logBook[this.patrolNum].addLastEncounter(this.currentEncounter);
            this.currentEncounter.closeWindows();            
        }
        this.currentBox++;

        console.log("Patrol Advance---------- step #" + this.currentBox);
        //reset current encounter

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
        var currentBoxName = this.patrol.patrolArray[this.currentBox];

        //check for automatic aborts
        if (this.sub.dieselsInop() == 2){
            if (this.currentBox == this.patrol.getPatrolLength() || this.currentBox == 1){
                //When 1 square from port, scuttling
                //Roll 2d6. 2-10 is successful recovery of crew, new uboat. 11 or 12 crew is lost at sea, game over
                //TODO
                let recoveryRoll = d6Rollx2();
                if (this.sub.getSystemStatus("Radio") == "Inoperative") {
                    recoveryRoll += 4;
                }
                if (recoveryRoll <= 10) {
                    //Crew recovered. New uboat
                    this.setEventResolved(false);
                    this.popup2.abortTowedBackPopup();
                    await until(_ => this.eventResolved == true);
                    this.currentBox = this.patrol.getPatrolLength();
                    this.endPatrol();
                    return;
                }
                else {
                    let cause = "Crew lost at sea " + this.gm.getFullDate();
                    cause += " - Forced to scuttle after damage to both diesel engines by the " + this.currentEncounter.shipList[0].getClassAndName();
                    console.log("GAME OVER: " + cause);
                    const goPopup = new GameOverPopup(this.tv, this.gm, this.gm.currentEncounter, cause);
                }
            }
            else {
                let cause = "Scuttled " + this.gm.getFullDate();
                cause += " - Forced to scuttle after damage to both diesel engines by the " + this.currentEncounter.shipList[0].getClassAndName();
                console.log("GAME OVER: " + cause);
                const goPopup = new GameOverPopup(this.tv, this.gm, this.gm.currentEncounter, cause);
            }
        }

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

        //check second encounter when 1 diesel is inop
        if (this.sub.dieselsInop() == 1 && this.contFromAbort) {
            currentEncounterType = this.patrol.getEncounterType(currentBoxName, this.getYear(), this.randomEvent, roll);
            console.log("Second Encounter: " + currentEncounterType);
            this.currentEncounter = new Encounter(this.tv, this, this.patrol, this.sub, currentEncounterType, currentBoxName, null);
            await until(_ => this.tv.isInEncounter == false);
            console.log("End Second Encounter");
        }

        if (this.abortingPatrol && !this.contFromAbort) {
            this.contFromAbort = true;
        }

        if (this.currentBox == this.patrol.getPatrolLength()) {
            this.endPatrol();
        }
    }

    /**
     * Sets aborting patrol to true and immediately changes currentBox to nearest transit, if not in one already.
     * If at start of patrol (first 1-4 transit boxes), places boat in the corresponding box at the end of the patrol.
     */
    async abortPatrol() {
        this.abortingPatrol = true;

        //logic to place uboat at correct box to abort
        let patrolLength = this.patrol.getPatrolLength();
        let stepsToEnd = patrolLength - this.currentBox;
        let transitSteps = 2;
        if (this.patrol.NAorders || this.patrol.WAfricanCoast) { 
            transitSteps = 4;
        }
        if (stepsToEnd > patrolLength / 2) {
            stepsToEnd = patrolLength - stepsToEnd;
        }
        if (stepsToEnd > transitSteps) {
            this.currentBox = patrolLength - transitSteps; //removed +1 so that player actually is placed right before the correct box
        }
        else {
            this.currentBox = patrolLength - stepsToEnd;   //removed +1 so that player actually is placed right before the correct box
        }

        this.eventResolved = false;
        this.popup2.abortPatrolPopup();
        await until(_ => this.eventResolved == true);
    }

    async endPatrol() {
        if (this.currentBox > 0) {
            this.logBook[this.patrolNum].addLastEncounter(this.currentEncounter);
            this.currentEncounter.closeWindows();            
        }

        this.tv.changeScene("Port", "Day", null, false);
        this.patrolling = false;
        this.eventResolved = false;
        this.popup2.endPatrolPopup();
        await until(_ => this.eventResolved == true);
    }
}