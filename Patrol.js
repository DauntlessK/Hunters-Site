class Patrol{
    constructor(gm){
        this.gm = gm;

        //array of orders options for a given date
        this.ordersArray = null;

        //array of each "step" of a patrol, which includes port, transit and patrol/mission spots
        this.patrolArray = [];

        this.getPatrol();
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

    async getPatrol(){
        //Gets patrol based on date, type, permanent assignments, etc from patrol text files.

        var patrolChart = null;
        if (this.gm.date_year == 1939 || (this.gm.date_month <= 2 && this.gm.date_year == 1940)){patrolChart = "PatrolChart1.txt";}   // 1939 - Mar 1940 
        else if (this.gm.date_month > 2 && this.gm.date_month <= 5 && this.gm.date_year == 1940){patrolChart = "PatrolChart2.txt";}   // 1940 - Apr - Jun    
        else if (this.gm.date_month >= 6 && this.gm.date_month <= 11 && this.gm.date_year == 1940){patrolChart = "PatrolChart3.txt";} // 1940 - Jul - Dec 
        else if (this.gm.date_month >= 0 && this.gm.date_month <= 5 && this.gm.date_year == 1941){patrolChart = "PatrolChart4.txt";}  // 1941 - Jan - Jun
        else if (this.gm.date_month >= 6 && this.gm.date_month <= 11 && this.gm.date_year == 1941){patrolChart = "PatrolChart5.txt";} // 1941 - Jul - Dec
        else if (this.gm.date_month >= 0 && this.gm.date_month <= 5 && this.gm.date_year == 1942){patrolChart = "PatrolChart6.txt";}  // 1942 - Jan - Jun
        else if (this.gm.date_month >= 6 && this.gm.date_month <= 11 && this.gm.date_year == 1942){patrolChart = "PatrolChart7.txt";} // 1942 - Jul - Dec
        else if (this.gm.date_year == 1943){patrolChart = "PatrolChart8.txt";}                                                        // 1943
        else{
            console.log("Error getting patrol chart .txt file.")
        }

        const ordersRoll = d6Rollx2();
        const textFile = "data/" + patrolChart;

        console.log("Beginning Fetch");
        this.ordersArray = await getDataFromTxt(textFile);
        //fetch(textFile).then(convertData).then(processData);
        
        sleep(3000).then(() => {
            this.gm.currentOrders = this.ordersArray[ordersRoll];
            console.log(this.gm.currentOrders);
    
            this.validatePatrol();
            this.buildPatrol();
        });
    }

    validatePatrol(){
        //checks if the randomly chosen patrol is valid given the U-boat type, permanent posts, etc
        
        //Deal with changes in orders based on U-Boat type
        console.log("Validating Patrol");
        if (this.gm.currentOrders == "Mediterranean" || this.gm.currentOrders == "Artic" && (self.sub.getType().includes("IX"))){       //IX cannot patrol Artic or Med
            this.gm.currentOrders = "West African Coast";
        }
        if ((this.gm.currentOrders == "West African Coast" || this.gm.currentOrders == "Caribbean") && (self.sub.getType().includes("VII"))){   // VII Cannot patrol west africa
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

        //change loadout of boat by adding mines
        //todo change tube loads
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

    buildPatrol(){
        //Builds array of strings, each item being a step in the patrol. Step 0 is port.
        //build patrol for non NA patrols

        console.log("Building Patrol");
        var NAorders = false;
        if (this.gm.currentOrders == "North America" || self.currentOrders == "Carribean"){
            NAorders = True
        }
    
        for (let x=0; x < this.getPatrolLength() + 1; x++){
            console.log("Looped through patrol array " + x + " times.");
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
                    otherSpot = self.currentOrders.replace("(Abwehr Agent Delivery)", "")
                }
                else if (this.gm.currentOrders.includes("Abwehr")){
                    otherSpot = self.currentOrders.replace("(Minelaying)", "");
                }
                else if (this.gm.currentOrders.includes("Wolfpack")){
                    otherSpot = self.currentOrders.replace("(Wolfpack)", "");
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
        console.log("patrolArray =");
        console.log(this.patrolArray);
    }
}