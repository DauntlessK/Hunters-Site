class GameManager{
    constructor(tv){

        this.tv = tv;
        this.sub = null;

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

    startGame(name, num){
        this.kmdt = name;
        this.id = num;
        this.tv.mainUI.subNum = this.getFullUboatID();
        this.tv.mainUI.rank = this.rank[0] + " " + this.kmdt;
        this.tv.mainUI.date = this.getFullDate();

        //Popup to select sub
        const introPopup = new Popup("subSelect", this.tv, this);
        
    }

    getFullUboatID(){
        return "U-" + this.id;
    }

    getFullDate(){
        return this.month[this.date_month] + " - " + this.date_year;
    }

    getLRankAndName(){
        return this.rankLong[0] + " " + this.kmdt;
    }

    getRankAndName(){
        return this.rank[0] + " " + this.kmdt;
    }

    getStartingRank(){
        //Determines the starting rank of the player
        if (this.sub.getType() == "IXA" || this.sub.getType() == "IXB"){
            this.sub.crew_levels["Kommandant"] = 1;
        }
        else{
            console.log(d6Roll());
        }
    }

    setSub(subChosen){
        //takes input from what user selected and adjusts parameters for submarine
        this.sub = new Uboat(subChosen);
        switch (subChosen){
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
                break;
        }
    }
}