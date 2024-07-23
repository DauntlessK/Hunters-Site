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
        this.tv.changeScene(this.encounterType, this.timeOfDay, this, false);

        this.gm.setEventResolved(false);

        this.depth = "";               //Surfaced, Periscope Depth, or Deep
        this.range = "";               //Close, Medium, or Long
        this.rangeNum = 0;             //8, 7, 6
        this.canFireForeAndAft = false;
        this.firedForeAndAft = false;
        this.firedG7a = false;

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
    
    isEscorted() {
        if (this.shipList[0].type == "Escort") {
            return true;
        }
        return false;
    }

    endEncounter() {
        this.tv.finishEncounter();
    }

    async event() {
        //create popup based on that encounter to begin encounter
        this.encPop = new EncounterPopup(this.tv, this.gm, this.encounterType, this.shipList);
        await until(_ => this.gm.eventResolved == true);

        console.log(this.encounterType);
        if (this.encounterType == "No Encounter" || this.encounterType == "Aircraft") {
            //not sure what is needed here
        }
        else {
            this.attackRound();
        }
    }

    async attackRound() {
        console.log("Attack Round started");
        //If mines are on the boat, ignore encounter TODO FIX
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
                    this.tv.changeScene(this.encounterType, this.timeOfDay, this, true);
                }
                else {
                    this.timeOfDay = "Night";
                    this.tv.changeScene(this.encounterType, this.timeOfDay, this, true);
                }
            }
        }

        //next popup to get depth and range
        this.gm.setEventResolved(false);
        var attackPopup = new AttackDepthAndRangePopup(this.tv, this.gm, this.encounterType, this.shipList, this.timeOfDay);
        await until(_ => this.gm.eventResolved == true);

        this.depth = attackPopup.getDepth();
        this.range = attackPopup.getRange();
        switch (this.range) {
            case "Short Range":
                this.rangeNum = 8;
                break;
            case "Medium Range":
                this.rangeNum = 7;
                break;
            case "Long Range":
                this.rangeNum = 6;
                break;
        }
        if (this.depth == "Periscope Depth") {
            this.tv.gameObjects.uboat.sprite.dive();
            this.tv.mainUI.deckGunButton.changeState("Disabled");
            this.canFireForeAndAft = true;
        }
        Object.values(this.tv.gameObjects).forEach(object => {
            object.sprite.setRange(this.range);
          })
        //Force update Deck Gun Button
        this.tv.mainUI.deckGunButton.getLatestState();

        //Allow for firing (selecting target and tubes)
        this.tv.setFiringMode(true);

        //Await for at least one type of firing before moving on
        this.gm.setEventResolved(false);
        await until(_ => this.gm.eventResolved == true);

        this.resolveUboatAttack();


    }

    resolveUboatAttack() {
        if (this.gm.sub.isFiringDeckGun > 0) {
            this.resolveDeckGun(this.gm.sub.isFiringDeckGun);
        }
        else {
            this.resolveTorpedoes();
        }

        this.gm.sub.fire();
    }

    resolveDeckGun(numShots) {
        //Performed for each shot
        for (let i = 0; i < numShots; i++) {
            var gunRoll = d6Rollx2();
            var rollMod = 0;

            //Apply mods
            if (this.gm.sub.sub.knightsCross >= 2){
                rollMod -= 1;
            }
            if (this.gm.sub.sub.crew_levels["Crew"] == 0) {
                rollMod += 1;
            }
            if (this.gm.sub.sub.crewKnockedOut()) {
                rollMod += 1;
            }
            if (this.gm.sub.sub.crew_health["Kommandant"] > 1) {
                if (this.gm.sub.sub.crew_health["Watch Officer"] > 1) {
                    rollMod += 2;
                }    
                else {
                    rollMod += 1;
                }
            }

            //Check roll and mods
            var damage = 1;
            if (gunRoll + rollMod <= this.rangeNum) {
                var damRoll = d6Roll();
                var damMod = 0;
                if (self.sub.getType().includes("IX")) {
                    damMod -= 1;
                }
                if (damRoll <= 1) {
                    damage = 2;
                }
                    
                ship[target].takeDamage(damage)
                console.log("Deck Gun did " + damage + " damage!");
            }
            else{
                console.log("Deck Gun Missed");
            }
        }
    }

    resolveTorpedoes() {
        //loop through each ship and resolve incoming torpedoes
        for (let i = 0; i < this.shipList.length; i++) {
            while (this.shipList[i].hasTorpedoesIncoming()) {
                var currentShip = this.shipList[i];
                var torpRoll = d6Rollx2();
                var rollMod = 0;

                //Apply all modifiers to roll
                if (this.depth == "Surfaced") {
                    rollMod -= 1;
                }
                if (this.gm.sub.knightsCross >= 2) {
                    rollMod -= 1;
                }
                if (this.gm.sub.crew_levels["Crew"] == 0) {
                    rollMod += 1;
                }
                if (this.gm.sub.isCrewKnockedOut()) {
                    rollMod += 1;
                }
                if (this.gm.sub.crew_health["Kommandant"] > 1) {
                    if (this.gm.sub.crew_health["Watch Officer 1"] > 1) {
                        rollMod += 2;
                    }
                    else {
                        rollMod += 1;
                    }
                }
                if (this.gm.sub.isFiringForeAndAft && this.gm.sub.knightsCross == 0) {
                    rollMod += 1;
                    this.firedForeAndAft = true;
                }
                
                //Resolve G7a Torpedo
                if (currentShip.G7aINCOMING > 0) {
                    this.firedG7a = true;
                    console.log("Resolving G7a on " + currentShip.name);

                    if (torpRoll + rollMod <= this.rangeNum) {
                        console.log("HIT!")
                    }
                    else {
                        console.log("MISS");
                    }
                    currentShip.G7aINCOMING--;
                }

                //Resolve G7e Torpedo
                if (currentShip.G7eINCOMING > 0) {
                    //Additional Mod for G7e at range
                    if (this.range == "Medium") {
                        rollMod += 1;
                    }
                    else if (this.range == "Long") {
                        rollMod += 2;
                    }

                    console.log("Resolving G7e on " + currentShip.name);

                    if (torpRoll + rollMod <= this.rangeNum) {
                        console.log("HIT!")
                    }
                    else {
                        console.log("MISS");
                    }
                    currentShip.G7eINCOMING--;
                }
            }
        }
        console.log("All ships resolved.");
    }
}