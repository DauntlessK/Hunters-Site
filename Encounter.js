class Encounter {
    constructor(tv, gm, encounterType, existingShips) {
        if (encounterType != "No Encounter") { console.log("ALARRRRM!  " + encounterType); }

        this.tv = tv;
        this.gm = gm;

        this.encounterType = encounterType;
        this.shipList = [];

        if (existingShips == null) {
            this.shipList = this.getShips(encounterType);
        }
        else {
            this.shipList = existingShips;
        }

        this.tv.enterEncounter();
        this.timeOfDay = this.getTimeOfDay(false)
        this.tv.changeScene(this.encounterType, this.timeOfDay, this.shipList, false);

        this.gm.setEventResolved(false);

        this.depth = "";
        this.range = "";

        this.encPop = null;
        this.event();
    }

    //Creates and returns a list of ship object(s) for a given encounter
    getShips(enc) {
        var tgt = []
        var ship1 = null;
        var ship2 = null;
        var ship3 = null;
        var ship4 = null;

        //First add escort if applicable
        if (enc == "Convoy" || enc == "Capital Ship" || enc.includes("Escort")) {
            var esc = new Ship("Escort", this.gm.date_month, this.gm.date_year, this.gm.shipsSunk, this.gm.currentOrders);
            tgt.push(esc);
        }

        if (enc == "Tanker") {
            var ship1 = new Ship("Tanker", this.gm.date_month, this.gm.date_year, this.gm.shipsSunk, this.gm.currentOrders);
            tgt.push(ship1);
        }

        if (enc == "Capital Ship") {
            var ship1 = new Ship("Tanker", this.gm.date_month, this.gm.date_year, this.gm.shipsSunk, this.gm.currentOrders);
            tgt.push(ship1);
        }

        if (enc == "Ship" || enc == "Two Ships" || enc == "Convoy" || enc == "Ship + Escort" || enc == "Two Ships + Escort") {
            var ship1 = new Ship(this.getTargetShipType(), this.gm.date_month, this.gm.date_year, this.gm.shipsSunk, this.gm.currentOrders);
            tgt.push(ship1);
        }

        if (enc == "Two Ships" || enc == "Two Ships + Escort" || enc == "Convoy") {
            var ship2 = new Ship(this.getTargetShipType(), this.gm.date_month, this.gm.date_year, this.gm.shipsSunk, this.gm.currentOrders);
            tgt.push(ship2);
        }

        if (enc == "Convoy") {
            var ship3 = new Ship(this.getTargetShipType(), this.gm.date_month, this.gm.date_year, this.gm.shipsSunk, this.gm.currentOrders);
            var ship4 = new Ship(this.getTargetShipType(), this.gm.date_month, this.gm.date_year, this.gm.shipsSunk, this.gm.currentOrders);
            tgt.push(ship3);
            tgt.push(ship4);
        }

        console.log("Encounter ships:");
        console.log(tgt);
        return tgt;
    }

    //Determines the enemy cargo ship type
    getTargetShipType() {
        const shipRoll = d6Roll();
        switch (shipRoll) {
            case 1:
            case 2:
            case 3:
                return "Small Freighter";
            case 4:
            case 5:
                return "Large Freighter";
            case 6:
                return "Tanker";
        }
    }

    //Returns string of time of day (Day or Night) based on current orders and die roll
    getTimeOfDay(isFollowing) {
        //first deal with actic always day or always night months if applicable
        if (this.currentOrders == "Arctic" && (this.date_month == 5 || this.date_month == 11)) {
            if (this.date_month == 5){
                return "Day";
            }
            else if (this.date_month == 11) {
                return "Night";
            }
            else {
                console.log("Error in Artic Orders");
            }
        }
        //otherwise, if following, choose day or night to attack
        else if (isFollowing) {
            //print("Attack during day or night?")
            //print("1) Day")
            //print("2) Night")
            //choice = input()
            //match choice:
            //    case "1" | "Day" | "day":
            //        return "Day"
            //    case "2" | "Night" | "night":
            //        return "Night"
            console.log("TODO follow choice");
        }
        //otherwise randomly determine day or night
        else {
            var timeRoll = d6Roll();
            //deal with arctic times
            if (this.currentOrders == "Artic") {
                switch (this.date_month) {
                    case 0:
                    case 1:
                    case 2:
                    case 9:
                    case 10:
                        if (timeRoll <= 2) {
                            return "Day";
                        }
                        else {
                            return "Night";
                        }
                    case 3:
                    case 4:
                    case 6:
                    case 7:
                    case 8:
                        if (timeRoll <= 4) {
                            return "Day";
                        }
                        else {
                            return "Night";
                        }
                    case 5:
                        return "Day";
                    case 11:
                        return "Night";
                }
            }
            //non-arctic day/night 50/50 roll
            else {
                if (timeRoll <= 3) {
                    return "Day";
                }
                else {
                    return "Night";
                }
            }
        }
    }  

    endEncounter() {
        this.tv.finishEncounter();
    }

    async event() {
        //create popup based on that encounter to begin encounter
        this.encPop = new EncounterPopup(this.tv, this.gm, this.encounterType, this.shipList);
        await until(_ => this.gm.eventResolved == true);

        if (this.encounterType != "No Encounter") {
            this.engage();
        }
    }

    async engage() {
        //If mines are on the boat, ignore encounter
        if (this.gm.sub.hasMinesLoaded() && this.shipList[0].getType() == "Escort") {
            console.log("MINES LOADED");
            this.endEncounter();
            return;
        }

        //check if ignoring ship(s)
        var waitRoll = d6Roll();
        if (this.encPop.getChoice() == "ignore") {
            this.tv.changeScene("", this.timeOfDay, null, false);
            this.endEncounter();
            return;
        }
        //check if waiting - see if roll to wait is successful
        else if (this.encPop.getChoice() == "wait") {
            if (waitRoll >= 5) {
                console.log("TODO deal with lost them!");
                if (this.timeOfDay == "Night") {
                    this.timeOfDay = "Day";
                    this.tv.changeScene(this.encounterType, this.timeOfDay, null, true);
                }
                else {
                    this.timeOfDay = "Night";
                    this.tv.changeScene(this.encounterType, this.timeOfDay, null, true);
                }
                this.endEncounter();
                return;
            }
            else {
                console.log("Successfully followed!");
                if (this.timeOfDay == "Night") {
                    this.timeOfDay = "Day";
                    this.tv.changeScene(this.encounterType, this.timeOfDay, this.shipList, true);
                }
                else {
                    this.timeOfDay = "Night";
                    this.tv.changeScene(this.encounterType, this.timeOfDay, this.shipList, true);
                }
            }
        }

        //next popup to get depth and range
        this.gm.setEventResolved(false);
        var attackPopup = new AttackDepthAndRangePopup(this.tv, this.gm, this.encounterType, this.shipList, this.timeOfDay);
        await until(_ => this.eventResolved == true);

        this.depth = attackPopup.getDepth();
        this.range = attackPopup.getRange();
        if (this.depth == "Periscope Depth") {
            this.tv.gameObjects.uboat.sprite.dive();
            this.tv.mainUI.deckGunButton.changeState("Disabled");
        }
        Object.values(this.tv.gameObjects).forEach(object => {
            object.sprite.setRange(range);
          })

        //Allow for firing (selecting target and tubes)
        this.tv.setFiringMode(true);

    }
}