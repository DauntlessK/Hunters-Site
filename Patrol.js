class Patrol{
    constructor(tv, gm){
        this.gm = gm;
        this.tv = tv;

        //array of orders options for a given date
        this.ordersArray = null;

        //array of each "step" of a patrol, which includes port, transit and patrol/mission spots
        this.patrolArray = [];

        //all patrol charts init
        this.patrolChart1 = ["", "", "Spanish Coast", "British Isles", "British Isles", "British Isles (Minelaying)", "British Isles",
            "British Isles", "British Isles", "British Isles (Minelaying)", "British Isles", "British Isles", "West African Coast"];
        this.patrolChart2 = ["", "", "Spanish Coast", "Norway", "British Isles", "British Isles (Minelaying)", "British Isles", "British Isles",
            "British Isles", "British Isles", "Norway", "Norway", "West African Coast"];
        this.patrolChart3 = ["", "", "Spanish Coast", "Spanish Coast", "British Isles (Abwehr Agent Delivery)", "British Isles", "Atlantic", "British Isles",
            "British Isles", "British Isles (Minelaying)", "Atlantic", "West African Coast", "West African Coast"]; 
        this.patrolChart4 = ["", "", "Spanish Coast", "Atlantic (Wolfpack)", "British Isles", "Atlantic", "British Isles", "Atlantic", "Atlantic",
            "British Isles", "West African Coast", "West African Coast", "Mediterranean"];
        this.patrolChart5 = ["", "", "Mediterranean", "Spanish Coast", "British Isles", "Atlantic (Wolfpack)", "Atlantic", "Atlantic", "Atlantic", 
            "British Isles", "West African Coast", "Arctic", "Mediterranean"];
        this.patrolChart6 = ["", "", "Arctic", "North America (Abwehr Agent Delivery)", "Atlantic (Wolfpack)", "North America", "North America",
            "North America", "Atlantic", "British Isles", "Atlantic", "Caribbean", "West African Coast"];
        this.patrolChart7 = ["", "", "Mediterranean", "Arctic", "Atlantic (Wolfpack)", "North America", "Atlantic", "Atlantic", "Atlantic (Wolfpack)",
            "British Isles", "North America", "Atlantic", "West African Coast"];
        this.patrolChart8 = ["", "", "Mediterranean", "Atlantic (Wolfpack)", "British Isles", "North America", "Atlantic (Wolfpack)", "Atlantic",
            "Atlantic", "North America", "Arctic", "Atlantic (Wolfpack)", "West African Coast"];

        this.telegraphSrc = "";
    }

    async getPatrol(){
        //Gets patrol based on date, type, permanent assignments, etc from patrol text files.

        if (this.gm.date_year == 1939 || (this.gm.date_month <= 2 && this.gm.date_year == 1940)){this.ordersArray = this.patrolChart1;}   // 1939 - Mar 1940 
        else if (this.gm.date_month > 2 && this.gm.date_month <= 5 && this.gm.date_year == 1940){this.ordersArray = this.patrolChart2;}   // 1940 - Apr - Jun    
        else if (this.gm.date_month >= 6 && this.gm.date_month <= 11 && this.gm.date_year == 1940){this.ordersArray = this.patrolChart3;} // 1940 - Jul - Dec 
        else if (this.gm.date_month >= 0 && this.gm.date_month <= 5 && this.gm.date_year == 1941){this.ordersArray = this.patrolChart4;}  // 1941 - Jan - Jun
        else if (this.gm.date_month >= 6 && this.gm.date_month <= 11 && this.gm.date_year == 1941){this.ordersArray = this.patrolChart5;} // 1941 - Jul - Dec
        else if (this.gm.date_month >= 0 && this.gm.date_month <= 5 && this.gm.date_year == 1942){this.ordersArray = this.patrolChart6;}  // 1942 - Jan - Jun
        else if (this.gm.date_month >= 6 && this.gm.date_month <= 11 && this.gm.date_year == 1942){this.ordersArray = this.patrolChart7;} // 1942 - Jul - Dec
        else if (this.gm.date_year == 1943){this.ordersArray = this.patrolChart8;}                                                        // 1943
        else{
            console.log("Error getting patrol array.");
        }

        const pickOrderRoll = d6Roll();
        var unique = this.ordersArray.filter(onlyUnique);
        var isPicking = false
        if (pickOrderRoll <= this.gm.sub.crew_levels["Kommandant"] && !this.gm.permArcPost && !this.permMedPost){  //final should be <=
            isPicking = true;
            this.gm.ordersPopup(unique, isPicking);

            await until(_ => this.gm.eventResolved == true);

            this.validatePatrol();
            this.buildPatrol();
            this.gm.setCurrentOrdersLong();
        }
        else {
            const ordersRoll = d6Rollx2();
            this.gm.currentOrders = this.ordersArray[ordersRoll];

            this.validatePatrol();
            this.buildPatrol();
            this.gm.setCurrentOrdersLong();

            this.gm.ordersPopup(unique, isPicking);

            await until(_ => this.eventResolved == true);
        }
        console.log("Orders: " + this.gm.currentOrders);
    }

    validatePatrol(){
        //checks if the randomly chosen patrol is valid given the U-boat type, permanent posts, etc
        
        //Deal with changes in orders based on U-Boat type
        if (this.gm.currentOrders == "Mediterranean" || this.gm.currentOrders == "Artic" && (this.gm.sub.getType().includes("IX"))){       //IX cannot patrol Artic or Med
            this.gm.currentOrders = "West African Coast";
        }
        if ((this.gm.currentOrders == "West African Coast" || this.gm.currentOrders == "Caribbean") && (this.gm.sub.getType().includes("VII"))){   // VII Cannot patrol west africa
            this.gm.currentOrders = "Atlantic";
        }
        if (this.gm.currentOrders == "British Isles" && this.gm.sub.getType() == "VIID"){                                                // VIID Minelays in BI
            this.gm.currentOrders = "British Isles (Minelaying)";
        }

        //deal with permanent stations
        if (this.gm.permMedPost){
            this.gm.currentOrders = "Mediterranean";
        }
        if (this.gm.permArcPost){
            this.gm.currentOrders = "Arctic";
        }

        //change loadout of boat by adding mines in the tube, replacing torpedoes in tube
        if (this.gm.currentOrders.includes("Minelaying")){
            this.gm.sub.loadMines();
        }
        if (this.gm.currentOrders.includes("Abwehr")){
            this.gm.sub.crew_health["Abwehr Agent"] = 0;
        }
        //Do not allow VIID and VIIC Flak in the Med, so recall get patrol to get new orders and get new orders
        if (this.gm.sub.getType() == "VIID" || this.gm.sub.getType() == "VIIC Flak"){
            if (this.gm.currentOrders  == "Mediterranean"){
                this.getPatrol;
            }
        }
    }

    //Determines full length of a given patrol (number of on station steps + all transit steps)
    getPatrolLength(){
        switch (this.gm.currentOrders) {
            case "North America":
            case  "Caribbean":
                if (this.gm.sub.getType() == "IXA") {
                    return this.gm.sub.patrol_length  + 8;
                }
                else {
                    return this.gm.sub.patrol_length - 1 + 8;  // NA patrol has 1 less on station patrol + 2 BoB + EXTRA 4 transits (8 total)
                }
                break;
            case "West African Coast":
                if (this.gm.sub.getType() == "IXA") {
                    return this.gm.sub.patrol_length  + 6;
                }
                else {
                    return this.gm.sub.patrol_length  + 5;  // WAC patrol has 1 less on station (like NA) + 2 extra transits (6 total)
                }
                break;
            default:
                return this.gm.sub.patrol_length + 4;
        }
    }

    //Builds array of strings, each item being a step in the patrol. Step 0 is port.
    buildPatrol(){
        
        this.tv.mainUI.telegraph.setSrc(this.getTelegraphSrc()); //set telegraph to correct png

        var NAorders = false;
        if (this.gm.currentOrders == "North America" || this.gm.currentOrders == "Caribbean"){
            NAorders = true
        }
        var WAfricanCoast = false;
        if (this.gm.currentOrders == "West African Coast") {
            WAfricanCoast = true;
        }
    
        for (let x=0; x < this.getPatrolLength() + 1; x++){
            if (x == 0){
                this.patrolArray.push("Port");
            }
            else if (x == 1 || x == this.getPatrolLength()){
                if (this.gm.francePost && !this.gm.permMedPost){
                    this.patrolArray.push("Bay of Biscay");
                }
                else{
                    this.patrolArray.push("Transit");
                }
            }
            else if (x == 2 && !this.gm.permMedPost && this.currentOrders == "Mediterranean"){
                this.patrolArray.push("Gibraltar");
            }
            else if (x == 2 || x == this.getPatrolLength() - 1){
                this.patrolArray.push("Transit");
            }
            else if (x == 3 && this.gm.currentOrders.includes("Abwehr") && !NAorders){
                this.patrolArray.push("Mission");
            }
            else if (x == 3 && this.gm.currentOrders.includes("Minelaying") && !NAorders && !WAfricanCoast){
                this.patrolArray.push("Mission");
            }
            else if ((x == 3 || x == this.getPatrolLength() - 2) && NAorders){
                this.patrolArray.push("Transit");
            }
            else if ((x == 3 || x == this.getPatrolLength() - 2) && WAfricanCoast){
                this.patrolArray.push("Transit");
            }
            else if ((x == 4 || x == this.getPatrolLength() - 3) && NAorders){
                this.patrolArray.push("Transit");
            }
            else if ((x == 4 || x == this.getPatrolLength() - 3) && WAfricanCoast){
                this.patrolArray.push("Transit");
            }
            else if (x == 5 && this.gm.currentOrders.includes("Abwehr") && NAorders){
                this.patrolArray.push("Mission");
            }
            else if (x == 5 && this.gm.currentOrders.includes("Minelaying" && NAorders)){
                this.patrolArray.push("Mission");
            }
            else{   //used to replace patrol array spots that have parentheses and should not (so location is only displayed)
                var otherSpot = this.gm.currentOrders;
                if (this.gm.currentOrders.includes("Abwehr")){
                    otherSpot = this.gm.currentOrders.replace("(Abwehr Agent Delivery)", "")
                }
                else if (this.gm.currentOrders.includes("Minelaying")){
                    otherSpot = this.gm.currentOrders.replace("(Minelaying)", "");
                }
                else if (this.gm.currentOrders.includes("Wolfpack")){
                    otherSpot = this.gm.currentOrders.replace("(Wolfpack)", "");
                }
                this.patrolArray.push(otherSpot);
            }
        }
        //remove one NA/Caribbean/WAC patrol if applicable
        //unsure if removal is needed if the patrol lengths are accurate===========
        /**if (this.gm.currentOrders == "North America"){
            const index = this.patrolArray.indexOf("North America");
            if (index > -1) { 
                this.patrolArray.splice(index, 1);
            }
        }
        if (this.gm.currentOrders == "Caribbean"){
            const index = this.patrolArray.indexOf("Caribbean");
            if (index > -1) { 
                this.patrolArray.splice(index, 1);
            }
        }*/
        console.log(this.patrolArray);
    }

    isMissionPatrol() {
        if (this.gm.currentOrders.includes("Minelaying") || this.gm.currentOrders.includes("Abwehr")){
            return true;
        }
        else {

            return false;
        }
    }

    getEncounterType(loc, year, randomEvent){
        roll = d6Rollx2();

        if (loc != "Additional Round of Combat"){
            console.log("Roll for " + loc + ": " + roll);
        }

        //first check if random event (natural 12)
        if (roll == 12 && randomEvent == false && loc != "Additional Round of Combat" && loc != "Mission"){
            console.log("TODO - deal with getting a random event");
        }

        switch (loc){
            case "Transit":
                switch (roll){
                    case 2:
                    case 3:
                        //aircraft
                        return "Aircraft";
                    case 12:
                        return "Ship";
                    default:
                        return "No Encounter";
                }
            case "Arctic":
                switch (roll){
                    case 2:
                        return "Capital Ship";
                    case 3:
                        return "Ship";
                    case 6:
                    case 7:
                    case 8:
                        return "Convoy";
                    case 12:
                        return "Aircraft";
                    default:
                        return "No Encounter";                 
                }
                break;
            case "Atlantic":
            case "Atlantic (Wolfpack)":
                switch (roll){
                    case 2:
                        return "Capital Ship";
                    case 3:
                        return "Ship";
                    case 6:
                    case 7:
                    case 9:
                    case 12:
                        return "Convoy";
                    default:
                        return "No Encounter";
                }
                break;
            case "British Isles":
                switch (roll) {
                    case 2:
                        return "Capital Ship";
                    case 5:
                    case 8:
                        return "Ship";
                    case 6:
                        return "Ship + Escort";
                    case 10:
                        return "Convoy";
                    case 12:
                        return "Aircraft";
                    default:
                        return "No Encounter";
                }
                break;
            case "Caribbean":
                switch (roll) {
                    case 2:
                    case 12:
                        return "Aircraft";
                    case 4:
                        return "Capital Ship";
                    case 7:
                        return "Ship";
                    case 8:
                        return "Convoy";
                    case 10:
                        return "Two Ships + Escort";
                    default:
                        return "No Encounter";
                }
                break;
            case "North America":
                switch (roll){
                    case 2:
                        return "Aircraft";
                    case 4:
                    case 6:
                        return "Ship";
                    case 5:
                        return "Two Ships + Escort";
                    case 8:
                        return "Two Ships";
                    case 9:
                    case 12:
                        return "Tanker";
                    case 11:
                        return "Convoy";
                    default:
                        return "No Encounter";
                }
                break;
            case "Norway":
                switch (roll) {
                    case 2:
                    case 12:
                        return "Aircraft";
                    case 3:
                    case 11:
                        return "Capital Ship";
                    case 4:
                    case 9:
                    case 10:
                        return "Ship + Escort";
                    default:
                        return "No Encounter"
                }
                break;
            case "Spanish Coast":
                switch (roll) {
                    case 2:
                    case 12:
                        return "Aircraft";
                    case 5:
                        return "Ship + Escort";
                    case 6:
                    case 7:
                        return "Ship";
                    case 10:
                    case 11:
                        return "Convoy";
                    default:
                        return "No Encounter" 
                }
                break;
            case "West African Coast":
                switch (roll) {
                    case 2:
                        return "Aircraft";
                    case 3:
                    case 7:
                        return "Ship";
                    case 6:
                    case 10:
                        return "Convoy";
                    case 9:
                        return "Ship + Escort";
                    case 12:
                        return "Aircraft";
                    default:
                        return "No Encounter" 
                }
                break;
            case "Additional Round of Combat":
            case "Gibraltar Passage":
                if (year == 1942) { roll = roll - 1;}
                if (year == 1943) { roll = roll - 2;}
                if (loc == "Gibraltar Passage") { roll = roll - 2;}
                //NOTE : Not sure the distinction matters between Gibralter vs addl combat- both return the same enc
                switch (roll) {
                    case -2:
                    case -1:
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        if (loc == "Additional Round of Combat") {
                            console.log("TO DO- Notify- An enemy escort has arrived!");
                            
                        }
                        else {
                            console.log("TO DO- Notify- An enemy escort has arrived!");
                        }
                        break;
                    case 4:
                    case 5:
                        if (loc == "Additional Round of Combat") {
                            return "Aircraft";
                        }
                        else {
                            return "Aircraft";
                        }
                    default:
                        return "No Encounter";
                }
                break;
            case "Bay of Biscay":
            case "Mission":
            case "Resupply":
                if (loc == "Bay of Biscay" && year == 1942) { roll = roll - 1;}
                else if (loc == "Bay of Biscay" && year == 1943) { roll = roll - 2;}
                switch (roll) {
                    case -2:
                    case -1:
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        return "Aircraft";
                    default:
                        return "No Encounter" 
                }
                break;         

        }
    }

    //creates the string for the correct telegraph png source file based on the patrol / U-boat
    getTelegraphSrc() {

        //Default to transitType (BoB or T), patrol (Patrol or Mission), and transitBoxes (2, 3 or 4)
        var transitType = "T";
        var missionType = "P";
        var transitBoxes = "2";

        //Bay of Biscay cases
        if (this.gm.francePost && (this.gm.currentOrders != "Norway" || this.gm.currentOrders != "Arctic")) { 
            transitType = "B"   
        }

        //Mission cases
        if (this.gm.patrol.isMissionPatrol()) {
            missionType = "M"
        }

        //Get num of transit boxes
        if (this.gm.currentOrders == "Caribbean" || this.gm.currentOrders.includes("America")) {
            transitBoxes = "4";
        }
        else if (this.gm.currentOrders == "South African Coast") {
            transitBoxes = "3";
        }

        const toReturn = "images/ui/telegraph/Telegraph" + this.gm.patrol.getPatrolLength() + "_" + missionType + "_" + transitBoxes + transitType + ".png";
         
        console.log("Telegraph Image: "+ toReturn);
        return toReturn;
    }
}