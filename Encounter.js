class Encounter {
    constructor(tv, gm, encounterType, existingShips) {
        this.shipListLoaded = false;
        if (encounterType != "No Encounter") { console.log("ALARRRRM!  " + encounterType); }

        this.tv = tv;
        this.gm = gm;

        this.encounterType = encounterType;
        this.shipList = [];

        //Encounter "Scoreboard" for results
        this.numHits = 0;
        this.numDuds = 0;
        this.numMissed = 0;
        this.numFired = 0;
        this.numSunk = 0;

        //Round "Scoreboard"
        this.round = 1;
        this.roundFired = 0;
        this.roundHits = 0;
        this.roundDuds = 0;
        this.roundDam = 0;

        //Get ships
        if (existingShips == null) {
            this.shipList = this.getShips(encounterType);
        }
        else {
            this.shipList = existingShips;

            //Remove already sunk ship from numSunk count so when they're counted later, they're not counted as sunk THIS enc
            for (let i = 0; i < this.shipList.length; i++) {
                if (this.shipList[i].sunk) {
                    this.numSunk--;
                }
            }
        }

        this.shipListLoaded = true;

        this.tv.enterEncounter();
        this.timeOfDay = this.getTimeOfDay(false)
        this.tv.changeScene(this.encounterType, this.timeOfDay, this, false);

        this.gm.setEventResolved(false);

        this.attackDepth = "";
        this.depth = "";               //Surfaced, Periscope Depth, or Deep
        this.range = "";               //Close, Medium, or Long
        this.rangeNum = 0;             //8, 7, 6
        this.canFireForeAndAft = false;
        this.firedForeAndAft = false;
        this.firedFore = false;
        this.firedAft = false;
        this.firedDeckGun = false;
        this.firedG7a = false;

        this.encPop = null;
        this.start();
    }

    async start() {
        //create popup based on that encounter to begin encounter
        this.encPop = new EncounterPopup(this.tv, this.gm, this.encounterType, this.shipList);
        await until(_ => this.gm.eventResolved == true);

        console.log(this.encounterType);
        if (this.encounterType == "No Encounter" || this.encounterType == "Aircraft") {
            //not sure what is needed here
        }
        else {
            this.attackRound(true);
        }
    }

    //Starts one round (one engagement of a single weapon)
    async attackRound(isFirstRound) {
        console.log("Attack Round started");

        if (isFirstRound) {
            //If mines are on the boat, ignore encounter TODO FIX
            if (this.gm.sub.minesLoadedForward && this.gm.sub.minesLoadedAft && this.shipList[0].getType() == "Escort") {
                console.log("MINES LOADED");
                this.endEncounter();
                return;
            }

            //check if ignoring ship(s)
            var waitRoll = d6Roll();
            if (this.encPop.getChoice() == "ignore") {
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
                    if (this.isEscorted()) {
                        this.escortDetection(false, 0, true);
                    }
                    break;
                case "Medium Range":
                    this.rangeNum = 7;
                    break;
                case "Long Range":
                    this.rangeNum = 6;
                    break;
            }
            if (this.depth == "Periscope Depth") {
                this.tv.uboat.sprite.dive();
                //this.tv.mainUI.deckGunButton.changeState("Disabled");
            }
            Object.values(this.tv.gameObjects).forEach(object => {
                object.sprite.setRange(this.range);
            })
            //Force update Deck Gun Button === don't think this is needed anymore
            //this.tv.mainUI.deckGunButton.getLatestState();
        }

        await until(_ => this.gm.subEventResolved == true);
        //Allow for firing (selecting target and tubes)
        this.tv.setFiringMode(true);

        //Await for at least one type of firing before moving on
        console.log("Before");
        this.gm.setEventResolved(false);
        await until(_ => this.gm.eventResolved == true);
        console.log("After");

        //Resolve fired weapons in this round then display results --- leads into escort detection or engaging again or following
        this.tv.setFiringMode(false);
        this.resolveUboatAttack();
        this.gm.setEventResolved(false);
        var roundResults = new RoundResultsPopup(this.tv, this.gm, this);
        await until(_ => this.gm.eventResolved == true);

        if (this.isEscorted()) {
            if (this.depth == "Surfaced") {
                this.tv.uboat.sprite.dive();
                //this.tv.mainUI.deckGunButton.changeState("Disabled");
                this.depth = "Periscope Depth";
            }
            this.escortDetection(false, 0, false);
        }

        this.endRound();

        if (this.hasSinkableShip()) {
            //Need to get input from player to see if attack will continue, follow, or leave
            this.attackRound(false);
        }
        else {
            this.endEncounter();
        }

    }

    //Clean up after firings
    endRound() {
        this.clearRoundStats();
        for (let i = 0; i < this.shipList.length; i++) {
            this.shipList[i].clearRoundStats();
        }
        if (this.depth = "Deep") {
            this.depth = "Periscope Depth";
        }
    }

    endEncounter() {
        console.log("Changing scene");
        this.tv.changeScene("", this.timeOfDay, null, false);
        if (this.depth != "Surfaced") {
            this.tv.uboat.sprite.surface();
        }
        this.tv.finishEncounter();
        //Prompt for reloads if torpedoes were fired
        if (this.numFired > 0) {
            this.tv.enterReloadMode();
        }
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
            var esc = new Ship(this.gm, "Escort", this.gm.date_month, this.gm.date_year, this.gm.shipsSunk, this.gm.currentOrders);
            tgt.push(esc);
        }

        if (enc == "Tanker") {
            var ship1 = new Ship(this.gm, "Tanker", this.gm.date_month, this.gm.date_year, this.gm.shipsSunk, this.gm.currentOrders);
            tgt.push(ship1);
        }

        if (enc == "Capital Ship") {
            var ship1 = new Ship(this.gm, "Tanker", this.gm.date_month, this.gm.date_year, this.gm.shipsSunk, this.gm.currentOrders);
            tgt.push(ship1);
        }

        if (enc == "Ship" || enc == "Two Ships" || enc == "Convoy" || enc == "Ship + Escort" || enc == "Two Ships + Escort") {
            var ship1 = new Ship(this.gm, this.getTargetShipType(), this.gm.date_month, this.gm.date_year, this.gm.shipsSunk, this.gm.currentOrders);
            tgt.push(ship1);
        }

        if (enc == "Two Ships" || enc == "Two Ships + Escort" || enc == "Convoy") {
            var ship2 = new Ship(this.gm, this.getTargetShipType(), this.gm.date_month, this.gm.date_year, this.gm.shipsSunk, this.gm.currentOrders);
            tgt.push(ship2);
        }

        if (enc == "Convoy") {
            var ship3 = new Ship(this.gm, this.getTargetShipType(), this.gm.date_month, this.gm.date_year, this.gm.shipsSunk, this.gm.currentOrders);
            var ship4 = new Ship(this.gm, this.getTargetShipType(), this.gm.date_month, this.gm.date_year, this.gm.shipsSunk, this.gm.currentOrders);
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

    //Returns true if the encounter still has a ship that can be sunk (non-escort)
    hasSinkableShip() {
        var numShipsSunk = 0;
        //If escorted, "ignore" escort when checking
        if (this.isEscorted()) {
            numShipsSunk++;
        }
        for (let i = 0; i < this.shipList.length; i++) {
            if (this.shipList[i].sunk) {
                numShipsSunk++;
            }
        }
        if (numShipsSunk == this.shipList.length) {
            return false;
        }
        else {
            return true;
        }
    }

    diveDeep() {
        this.depth = "Deep";
    }

    resolveUboatAttack() {
        if (this.gm.sub.isFiringDeckGun > 0) {
            this.resolveDeckGun(this.gm.sub.isFiringDeckGun);
            this.firedDeckGun = true;
        }
        else {
            this.resolveTorpedoes();
        }
        this.attackDepth = this.depth;
        this.gm.sub.fire();
    }

    resolveDeckGun(numShots) {
        //Performed for each shot
        for (let i = 0; i < this.shipList.length; i++) {
            while (this.shipList[i].deckGunINCOMING > 0) {
                var gunRoll = d6Rollx2();
                var rollMod = 0;

                //Apply mods
                if (this.gm.sub.knightsCross >= 2){
                    rollMod -= 1;
                }
                if (this.gm.sub.crew_levels["Crew"] == 0) {
                    rollMod += 1;
                }
                if (this.gm.sub.isCrewKnockedOut()) {
                    rollMod += 1;
                }
                if (this.gm.sub.crew_health["Kommandant"] > 1) {
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
                    if (this.gm.sub.getType().includes("IX")) {
                        damMod -= 1;
                    }
                    if (damRoll <= 1) {
                        damage = 2;
                    }
                        
                    this.shipList[i].takeDamage(damage)
                    this.roundDam += damage;
                    console.log("Deck Gun did " + damage + " damage!");
                }
                else{
                    console.log("Deck Gun Missed");
                }
                this.shipList[i].deckGunINCOMING--;
            }
        }
    }

    resolveTorpedoes() {
        //First check which sections (fore and/or aft or both) that fired
        //Check fore tubes first
        for (let i = 1; i < 5; i++) {
            if (this.gm.sub.tubeFiring[i] == true) {
                this.firedFore = true;
            }
        }
        //Check aft tubes first
        for (let i = 5; i < 7; i++) {
            if (this.gm.sub.tubeFiring[i] == true) {
                this.firedAft = true;
            }
        }
        //Check if fore and aft both fired
        if (this.firedFore && this.firedAft) {
            this.firedForeAndAft = true;
        }


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
                    this.numFired++;
                    this.roundFired++;
                    this.firedG7a = true;
                    console.log("Resolving G7a on " + currentShip.name);

                    //Determine if hit or miss
                    if (torpRoll + rollMod <= this.rangeNum) {
                        if (this.wasDud("G7a")) {
                            this.numDuds++;
                            this.roundDuds++;
                            currentShip.roundDuds++;
                        }
                        else {
                            this.numHits++;
                            this.roundHits++;
                            var damRoll = d6Roll();
                            var damage = 1;
                            switch (damRoll) {
                                case 1:
                                    damage = 4;
                                    break;
                                case 2:
                                    damage = 3;
                                    break;
                                case 3:
                                    damage = 2;
                                    break;
                            }
                            currentShip.takeDamage(damage);
                            this.roundDam += damage;
                        }
                    }
                    else {
                        this.numMissed++;
                    }
                    currentShip.G7aINCOMING--;
                }

                //Resolve G7e Torpedo
                if (currentShip.G7eINCOMING > 0) {
                    this.numFired++;
                    this.roundFired++;
                    //Additional Mod for G7e at range
                    if (this.range == "Medium") {
                        rollMod += 1;
                    }
                    else if (this.range == "Long") {
                        rollMod += 2;
                    }

                    console.log("Resolving G7e on " + currentShip.name);

                    //Determine if hit or miss
                    if (torpRoll + rollMod <= this.rangeNum) {
                        if (this.wasDud("G7e")) {
                            this.numDuds++;
                            this.roundDuds++;
                            currentShip.roundDuds++;
                        }
                        else {
                            this.numHits++;
                            this.roundHits++;
                            var damRoll = d6Roll();
                            var damage = 1;
                            switch (damRoll) {
                                case 1:
                                    damage = 4;
                                    break;
                                case 2:
                                    damage = 3;
                                    break;
                                case 3:
                                    damage = 2;
                                    break;
                            }
                            currentShip.takeDamage(damage);
                            this.roundDam += damage;
                        }
                    }
                    else {
                        this.numMissed++;
                    }
                    currentShip.G7eINCOMING--;
                }
            }
        }
        //Count sunk ships
        for (let i = 0; i < this.shipList.length; i++) {
            if (this.shipList[i].sunk) {
                this.numSunk++;
            }
        }
        console.log("All ships resolved.");
    }

    clearRoundStats() {
        this.roundHits = 0;
        this.roundDuds = 0;
        this.roundDam = 0;
        this.roundFired = 0;
        this.round++;
    }

    //Determines if a combat round can be conducted - returns "All", "Fore", "Aft", "Deck Gun", "None"
    canContinueAttack(){
        var canFireFore = true;
        var canFireAft = true;
        var canFireDeckGun = true;

        if (this.firedFore && this.firedAft && this.firedDeckGun) {
            //Fired all weapons already
            return false;
        }

        if (this.firedFore && this.firedAft)
        
        if (this.gm.sub.systems["Forward Torpedo Doors"] > 0 || this.gm.sub.minesLoadedForward || !this.gm.sub.canFire("Fore")) {
            canFireFore = false;
        }
        if (this.gm.sub.systems["Aft Torpedo Doors"] > 0 || this.gm.sub.minesLoadedAft || !this.gm.sub.canFire("Aft")) {
            canFireAft = false;
        }
        if (this.gm.sub.systems["Deck Gun"] > 0 || this.isEscorted() || !this.gm.sub.canFire("Deck Gun")) {
            canFireDeckGun = false;
        }

        if (canFireFore && canFireAft && canFireDeckGun) {
            return "All"
        }
    }

    //Determines if the torpedo that hit was a dud based on year and D6 roll
    wasDud(torpType) {
        var dudRoll = d6Roll();

        if (this.gm.superiorTorpedoes) {
            dudRoll -= 1;
        }

        if (this.gm.getYear() >= 1941) {
            if (dudRoll == 1) {
                return true;
            }
            else {
                return false;
            }
        }
        else if (this.gm.getYear() == 1940 && this.gm.getMonth() >= 6) {
            if (dudRoll >= 2) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            if (torpType == "G7a" && dudRoll >= 2) {
                return false;
            }
            else if (torpType == "G7e" && dudRoll >= 3) {
                return false;
            }
            else {
                return true;
            }
        }
    }

    //Called when escort detection roll is required to see if Uboat was detected
    async escortDetection(previouslyDetected, wpMod, closeRangeCheck) {
        var escortRoll = d6Rollx2();
        var escortMods = 0;
        var canTestDive = false;

        this.gm.setSubEventResolved(false);
        var escortDetectionPopup = new EscortDetectionPopup(this.tv, this.gm, this, closeRangeCheck);
        await until(_ => this.gm.subEventResolved == true);

        //Check if in Wolfpack
        if (this.gm.currentOrders.includes("Wolfpack") && wpMod == 0 && this.encounterType == "Convoy") {
            wolfpackRoll = d6Roll();
            if (wolfpackRoll <= 5) {
                wpMod = -1;
            }
            else {
                wpMod = 1;
            }
            escortMods += wpMod;
        }

        if (this.gm.getYear() >= 1941 && this.rangeNum == 8) {
            escortMods = escortMods + (this.gm.getYear() - 1940)
        }
        if (this.gm.sub.knightsCross >= 3) {
            escortMods -= 1;
        }

        //Deal with close range detection (Before Firing)
        if (this.rangeNum == 8 && this.roundFired == 0 && !previouslyDetected) {
            escortMods -= 2;
        }
        else {
            //Check if player can dive to test depth
            if (this.depth != "Surfaced" || previouslyDetected) {
                canTestDive = true;
            }
            if (this.gm.sub.crew_health["Kommandant"] >= 2 && this.gm.sub.crew_health["Watch Officer 1"] >= 2) {
                escortMods += 2;
            }
            else if (this.gm.sub.crew_health["Kommandant"] == 2) {
                escortMods += 1;
            }
            if (this.gm.sub.systems["Fuel Tanks"] > 0) {
                escortMods += 1;
            }
            if (this.gm.sub.systems["Dive Planes"] > 0) {
                escortMods += 1;
            }
            if (this.encounterType == "Capital Ship") {
                escortMods += 1;
            }
            if (this.firedG7a && this.timeOfDay == "Day") {
                escortMods += 1;
            }
            if (previouslyDetected) {
                escortMods += 1;
            }
            if (this.rangeNum == 8 && (this.firedFore || this.firedAft)) {
                escortMods += 1;
            }
            if (this.attackDepth == "Surfaced" && this.timeOfDay == "Night" && this.gm.getYear() >= 1941) {
                escortMods += 1;
            }
            if (this.firedForeAndAft && !previouslyDetected) {
                escortMods += 1;
            }
            if (this.rangeNum == 6) {
                escortMods -=1;
            }
            if (this.depth == "Deep") {
                escortMods -= 1;
            }
        }

        console.log("Escort Roll: " + escortRoll + " | Escort Mods: " + escortMods);

        var results = "";
        if (escortRoll == 2) {
            console.log("Completely avoided detection!");
            results = "Completely Undetected";
        }
        if (escortRoll + escortMods <= 8) {
            console.log("We slipped away!");
            results = "Undetected";
        }
        else if (escortRoll + escortMods <= 11) {
            console.log("Detected!");
            results = "Detected";
        }
        else if (escortRoll + escortMods >= 12) {
            console.log("Detected! Big Problems!!");
            results = "Detectedx2";
        }

        this.gm.setSubEventResolved(false);
        escortDetectionPopup.escortResults(results)
        await until(_ => this.gm.subEventResolved == true);
    }
}