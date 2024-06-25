class GameManager{
    constructor(tv){

        this.tv = tv;
        this.sub = null;
        this.eventResolved = true;

        this.kmdt = "";
        this.id = "";
        this.month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        this.date_month = 8;
        this.date_year = 1939;
        this.rankLong = ["Oberleutnant zur See", "Kapitan-leutnant", "Korvetten-kapitan", "Fregatten-kapitan", "Kapitan zur See"];
        //this.rankLong = ["Oberleutnant zur See", "Kapitän-leutnant", "Korvetten-kapitän", "Fregatten-kapitän", "Kapitän zur See"];
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
        this.patrolNum = 1;
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
        this.G7aFired = 0;
        this.G7eFired = 0;
        this.firedForward = false;
        this.firedAft = false;
        this.firedDeckGun = false;
        this.shipsSunk = [];
        this.shipsSunkOnCurrentPatrol = [];
        this.damageDone = 0;
        this.hitsTaken = 0;
        this.randomEvents = 0;
        this.pastSubs = [];

        this.test = [];

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

        this.test = await getDataFromTxt("data/SmallFreighter.txt");
        console.log(this.test);

        //Popup to greet start of game
        this.eventResolved = false;
        this.setDate();
        this.getStartingRank();
        const popup2 = new Popup("startGameText", this.tv, this);
        await until(_ => this.eventResolved == true);
        this.sub.torpedoResupply();        
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
                this.currentOrdersLong = "Deliver Agent to Britian"
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
        this.eventResolved = false;
        const ordersPopUp = new OrdersPopup(this.tv, this, onlyUnique, isPicking);
        await until(_ => this.eventResolved == true);
        this.tv.changeScene("Sunny");
    }

    beginPatrol() {
        this.patrolling = true;
        this.currentBox = 1;
        console.log(this.test);
        this.advancePatrol(true);
    }

    advancePatrol(begin) {
        //patrol sequence to go through patrol
        if (! begin) {
            this.currentBox++;
        }

        console.log("Patrol Advance---------- " + this.currentBox);

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

        var currentEncounter = this.patrol.getEncounter(currentBoxName, this.getYear(), this.randomEvent);
        //create popup based on that encounter
        const patrolPop = new PatrolPopup(this.tv, this, currentEncounter);

        switch (currentEncounter) {
            case "encounterAttackShip":
                this.encounterAttack("Ship");
                break;
            case "encounterAttackShipEscort":
                this.encounterAttack("Ship");
                break;
        }

        console.log(currentEncounter);
    }

    //When any type of ship/convoy is rolled as an encounter
    encounterAttack(enc, existingShips) {
        console.log("ALARRRRM");
        var ship = [];
        if (existingShips == null) {
            ship = this.getShips(enc);
        }
        else {
            ship = existingShips;
        }
    }

    //creates and returns a list of ship object(s) for a given encounter
    getShips(enc) {
        var tgt = []

        //First add escort if applicable
        /**if (enc == "Convoy" || enc == "Capital Ship" || enc.includes("Escort")) {
            tgt.push(new Ship("Escort", this.date_month, this.date_year));
        }*/
            var ship1 = new Ship("Small Freighter", this.date_month, this.date_year)
            tgt.push(ship1);
            sleep(2000);
            console.log("Encounter ship: " + tgt);
    }
    
}