class Submarine{
    constructor(config){
        this.month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        this.date_month = 0;
        this.date_year = 1939;
        this.rank = ["Oberleutnant zur See", "Kapitän-leutnant", "Korvetten-kapitän", "Fregatten-kapitän",
        "Kapitän zur See"];
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
}