class Patrol{
    constructor(gm){
        this.gm = gm;

        //array of orders options for a given date
        this.ordersArray = null;

        //array of each "step" of a patrol, which includes port, transit and patrol/mission spots
        this.patrolArray = [];

        //all patrol charts init
        this.patrolChart1 = ["", "", "Spanish Coast", "British Isles", "British Isles", "British Isles(Minelaying)", "British Isles",
            "British Isles", "British Isles", "British Isles(Minelaying)", "British Isles", "British Isles", "West African Coast"];
        this.patrolChart2 = ["", "", "Spanish Coast", "Norway", "British Isles", "British Isles(Minelaying)", "British Isles", "British Isles",
            "British Isles", "British Isles", "Norway", "Norway", "West African Coast"];
        this.patrolChart3 = ["", "", "Spanish Coast", "Spanish Coast", "British Isles(Abwehr Agent Delivery)", "British Isles", "Atlantic", "British Isles",
            "British Isles", "British Isles(Minelaying)", "Atlantic", "West African Coast", "West African Coast"]; 
        this.patrolChart4 = ["", "", "Spanish Coast", "Atlantic(Wolfpack)", "British Isles", "Atlantic", "British Isles", "Atlantic", "Atlantic",
            "British Isles", "West African Coast", "West African Coast", "Mediterranean"];
        this.patrolChart5 = ["", "", "Mediterranean", "Spanish Coast", "British Isles", "Atlantic(Wolfpack)", "Atlantic", "Atlantic", "Atlantic", 
            "British Isles", "West African Coast", "Arctic", "Mediterranean"];
        this.patrolChart6 = ["", "", "Arctic", "North America(Abwehr Agent Delivery)", "Atlantic(Wolfpack)", "North America", "North America",
            "North America", "Atlantic", "British Isles", "Atlantic", "Caribbean", "West African Coast"];
        this.patrolChart7 = ["", "", "Mediterranean", "Arctic", "Atlantic(Wolfpack)", "North America", "Atlantic", "Atlantic", "Atlantic(Wolfpack)",
            "British Isles", "North America", "Atlantic", "West African Coast"];
        this.patrolChart8 = ["", "", "Mediterranean", "Atlantic(Wolfpack)", "British Isles", "North America", "Atlantic(Wolfpack)", "Atlantic",
            "Atlantic", "North America", "Arctic", "Atlantic(Wolfpack)", "West African Coast"];

        this.getPatrol();
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
            console.log("Error getting patrol array.")
        }

        const ordersRoll = d6Rollx2();
        //const textFile = "data/" + patrolChart;

        //this.ordersArray = await getDataFromTxt(textFile);
        //fetch(textFile).then(convertData).then(processData);
        
        sleep(3000).then(() => {
            this.gm.currentOrders = this.ordersArray[ordersRoll];
            console.log("Orders: " + this.gm.currentOrders);
    
            this.validatePatrol();
            this.buildPatrol();
            this.gm.setCurrentOrdersLong();
        });
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
            this.gm.currentOrders = "British Isles(Minelaying)";
        }

        //deal with permanent stations
        if (this.gm.permMedPost){
            this.gm.currentOrders = "Mediterranean";
        }
        if (this.gm.permArcPost){
            this.gm.currentOrders = "Arctic";
        }

        console.log(this.gm.currentOrders);
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

    getPatrolLength(){
        //Determines full length of a given patrol (number of on station steps + all transit steps
        switch (this.gm.currentOrders) {
            case "North America":
            case  "Caribbean":
                return this.gm.sub.patrol_length - 1 + 8;  // NA patrol has 1 less on station patrol + 2 BoB + EXTRA 2 transits
            default:
                return this.gm.sub.patrol_length + 4;
        }
    }

    buildPatrol(){
        //Builds array of strings, each item being a step in the patrol. Step 0 is port.
        //build patrol for non NA patrols

        var NAorders = false;
        if (this.gm.currentOrders == "North America" || this.gm.currentOrders == "Carribean"){
            NAorders = True
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
            else if (x == 2 || x == this.getPatrolLength() - 1){
                this.patrolArray.push("Transit");
            }
            else if (x == 3 && this.gm.currentOrders.includes("Abwehr") && !NAorders){
                this.patrolArray.push("Mission");
            }
            else if (x == 3 && this.gm.currentOrders.includes("Minelaying") && !NAorders){
                this.patrolArray.push("Mission");
            }
            else if ((x == 3 || x == this.getPatrolLength() - 2) && NAorders){
                this.patrolArray.push("Transit");
            }
            else if ((x == 4 || x == this.getPatrolLength() - 3) && NAorders){
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
        //remove one NA/Caribbean patrol if applicable
        if (this.gm.currentOrders == "North America"){
            this.patrolArray.remove("North America");
        }
        if (this.gm.currentOrders == "Carribean"){
            this.patrolArray.remove("Caribbean");
        }
        console.log(this.patrolArray);

        this.gm.ordersPopup();
    }
}