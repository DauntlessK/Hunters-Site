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
        this.lastPatrolWasUnsuccessful = false;
        this.abortingPatrol = false;
        this.permMedPost = false;
        this.permArcPost = false;
        this.francePost = false
        this.patrolArray = [];
        this.currentBox = 0;
        this.shipsSunk = [];
        this.shipsSunkOnCurrentPatrol = [];
        this.logBook = [];
        this.damageDone = 0;
        this.hitsTaken = 0;
        this.randomEvents = 0;
        this.pastSubs = [];
        this.adminMode = true;     //To choose orders
        

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
        const popup2 = new Popup("startGameText", this.tv, this);
        await until(_ => this.eventResolved == true);
        this.sub.torpedoResupply();        
    }

    setEventResolved(state) {
        this.eventResolved = state;
    }

    setSubEventResolved(state) {
        this.subEventResolved = state;
    }

    getFullUboatID(){
        return "U-" + this.id;
    }

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

    //Determines the starting rank of the player
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

    //sets date and other settings based on sub selection
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
                this.currentOrdersLong = "Wolfpack patrol the Mid-Atlantic";
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

    //patrol sequence to go through patrol
    async advancePatrol() {
    
        //close previous box and move to next square --- HERE ALSO UPDATE CURRENT PATROL LOG
        if (this.currentBox > 0) {
            this.logBook[this.patrolNum].addLastEncounter(this.currentEncounter);
            this.currentEncounter.closeWindows();            
        }
        this.currentBox++;

        console.log("Patrol Advance---------- step #" + this.currentBox);

        //todo - assignment to arctic
        if (this.currentOrders == "Arctic"){
            //TODO: Roll for artic assignment
            console.log("TODO roll for <=3");
        }

        //loop to run through patrol array (each patrol box)

        //handle aborting near end of patrol
        if (this.abortingPatrol && x < this.patrol.getPatrolLength() - 2) {
            this.currentBox++;
            return;
        }

        //if doctor is SW or KIA, see if any other injured crew members die (each patrol box, before encounter)
        if (this.sub.crew_health["Doctor"] >= 2){
            //check if any hurt crewmen
            //TODO: Crewman Death Check
            console.log("TO DO - CREWMEN DEATH CHECK")
        }

        //get the current box name of this patrol (i.e. "Transit", "Mission", "Atlantic", etc)
        var currentBoxName = this.patrol.patrolArray[this.currentBox];

        //check for automatic aborts
        if (this.sub.dieselsInop() == 2){
            if (this.currentBox == this.patrol.getPatrolLength()){
                //TODO: Popups (small)
                console.log("TO DO- POPUP TOWED INTO PORT");
            }
            else {
                //TODO: Scuttle
                console.log("TODO - SCUTTLE due to 2 diesel engines inop");
            }
        }
        else if (this.sub.dieselsInop() == 1 || this.sub.systems["Fuel Tanks"] == 2){
            console.log("TO DO- Abort Patrol due to fuel tanks or 1 diesel engine inop");
            this.abortingPatrol = true;
            return;
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

        //get current encounter (IE noEncounter, encounterAttackConvoy)
        var currentEncounterType = this.patrol.getEncounterType(currentBoxName, this.getYear(), this.randomEvent);
        console.log("Current Encounter: " + currentEncounterType);
        
        this.currentEncounter = new Encounter(this.tv, this, this.patrol, this.sub, currentEncounterType, currentBoxName, null);
        await until(_ => this.tv.isInEncounter == false);
        console.log("End Encounter");
    }
}