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
        this.rankLong = ["Oberleutnant zur See", "Kapitän-leutnant", "Korvetten-kapitän", "Fregatten-kapitän",
                            "Kapitän zur See"];
        this.rank = ["OLt zS", "KptLt", "KKpt", "FFKpt", "Kapitän zur See"];
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
    }

    async startGame(name, num, subType){
        this.kmdt = name;
        this.id = num;
        this.sub = new Uboat(subType, this.tv, this);
        this.tv.mainUI.subNum = this.getFullUboatID();
        this.tv.mainUI.rank = this.rank[this.sub.crew_levels["Kommandant"]] + " " + this.kmdt;
        this.tv.mainUI.date = this.getFullDate();

        //Popup to greet start of game
        this.getStartingRank();
        this.eventResolved = false;
        const popup2 = new Popup("startGameText", this.tv, this);

        await until(_ => this.eventResolved == true);
        this.setDate();
        this.sub.torpedoResupply();        
    }

    getFullUboatID(){
        if (this.sub == null){
            return "";
        }
        else{
            return "U-" + this.id;
        }
    }

    getFullDate(){
        if (this.sub == null){
            return "";
        }
        else{
            return this.month[this.date_month] + " - " + this.date_year;
        }
    }

    getLRankAndName(){
        if (this.sub == null){
            return "";
        }
        else{
            return this.rankLong[this.sub.crew_levels["Kommandant"]] + " " + this.kmdt;
        }
    }

    getRankAndName(){
        if (this.sub == null){
            return "";
        }
        else{
            return this.rank[this.sub.crew_levels["Kommandant"]] + " " + this.kmdt;
        }
    }

    getStartingRank(){
        //Determines the starting rank of the player
        if (this.sub.getType() == "IXA" || this.sub.getType() == "IXB"){
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
                case 1941:
                    if (roll >= 4){
                        this.sub.crew_levels["Kommandant"] = 1;
                    }
                    else{
                        this.sub.crew_levels["Kommandant"] = 0;
                    }
                case 1942:
                case 1943:
                    if (roll >= 6){
                        this.sub.crew_levels["Kommandant"] = 1;
                    }
                    else{
                        this.sub.crew_levels["Kommandant"] = 0;
                    }
            }
        }
    }

    setDate(){
        //sets date and other settings based on sub selection
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
}