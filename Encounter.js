class Encounter {
    constructor(tv, gm, patrol, sub, encounterType, currentBoxName, existingShips) {
        this.shipListLoaded = false;
        if (encounterType != "No Encounter" && encounterType != "Mission") { console.log("ALARRRRM!  " + encounterType); }

        this.tv = tv;
        this.gm = gm;
        this.patrol = patrol;
        this.currentBoxName = currentBoxName; //Current box- step of patrol (IE Mission, transit, British Isles, etc)
        this.encounterType = encounterType;   //Rolled encounter (no encounter, aircraft, convoy, etc)
        this.shipList = [];
        this.shipsSunk = [];
        this.sub = sub;

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

        //Get ships  NOT NEEDED??? ALWAYS GET SHIPS- NO CARRIED OVER
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
        this.timeOfDay = this.getTimeOfDay(false);
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
        this.wasDetected = false;
        this.wasDetectedAtCloseRange = false;
        this.ignored = false;
        this.follow = "";

        this.encPop = null;
        this.start(this.encounterType);
    }

    async start(encType) {
        //create popup based on that encounter to begin encounter
        this.encPop = new EncounterPopup(this.tv, this.gm, encType, this.currentBoxName, this.shipList);
        await until(_ => this.gm.eventResolved == true);

        //deal with mission boxes first
        if (this.currentBoxName == "Mission") {
            //loop to continue attempting mission (if at first unsuccessful but CAN succeed)
            let looping = 0;
            while (looping >= 0) {
                console.log("Mission attempt!");
                if (looping > 0) {
                    //get new encounterType (mission attempt)
                    this.encounterType = this.patrol.getEncounterType("Mission", this.gm.getYear(), this.gm.randomEvent);
                }

                //DEAL WITH ABWEHR or MINELAYING ROLL (already rolled - result is encounterType)
                this.gm.setEventResolved(false);
                var missionPopup = new MissionPopup(this.tv, this.gm, this.encounterType, this.gm.currentOrders);

                //Establish if mission was successful or not
                //Abwehr Missions
                if (this.gm.currentOrders.includes("Abwehr")){
                    //Successful delivery
                    if (this.encounterType == "No Encounter" && this.sub.isCrewmanFunctional("Abwehr Agent")) {
                        //Success
                        missionPopup.missionSuccess(this.gm.currentOrders);
                        this.gm.missionComplete = true;
                        this.endEncounter();
                        break;
                    }
                    else if (this.encounterType == "No Encounter") {
                        //Unsucessful - Agent dead
                        missionPopup.agentDeadFailure();
                        this.gm.missionComplete = false;
                        this.endEncounter();
                        break;
                    }
                    else {
                        //Aircraft
                        this.aircraftFlow();
                        looping++;
                        continue;
                    }
                }
                //Minelaying Missions
                else {
                    if (this.encounterType == "No Encounter") {
                        //Success, at least SOME mines were deployed
                        if (this.sub.getSystemStatus("Forward Torpedo Doors") == "Operational" || this.sub.getSystemStatus("Forward Torpedo Doors")) {
                            missionPopup.missionSuccess(this.gm.currentOrders);
                            this.gm.missionComplete = true;
                            this.endEncounter();
                            break;
                        }
                        else {
                            //no mines were deployed as doors were both broken. failure
                            missionPopup.torpedoDoorFailure();
                            this.gm.missionComplete = false;
                            this.endEncounter();
                            break;
                        }                        
                    }
                    else {
                        //Aircraft
                        this.aircraftFlow();
                        looping++;
                        continue;
                    }
                }
            }
        }//else - for non-mission patrol boxes
        else {
            switch (encType) {
                case "No Encounter":
                    break;
                case "Aircraft":
                    this.aircraftFlow();
                    break;
                default:
                    this.attackFlow(true);
            }
        }
    }

    //Starts engagement of ship or ship(s)
    async attackFlow(newAttack) {

        //If mines are on the boat and ship is escorted, ignore encounter TODO FIX
        if (this.sub.minesLoadedForward && this.sub.minesLoadedAft && this.shipList[0].getType() == "Escort") {
            console.log("MINES LOADED");
            this.endEncounter();
            return;
        }

        //If first round, get input on ignore, wait until day/night etc
        if (newAttack){
            //check if ignoring ship(s)
            var waitRoll = d6Roll();
            if (this.encPop.getChoice() == "ignore") {
                this.ignored = true;
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
        }

        //next popup to get depth and range
        this.gm.setEventResolved(false);
        var attackPopup = new AttackDepthAndRangePopup(this.tv, this.gm, this.encounterType, this.shipList, this.timeOfDay);
        await until(_ => this.gm.eventResolved == true);

        this.depth = attackPopup.getDepth();
        this.range = attackPopup.getRange();

        if (this.depth == "Periscope Depth") {
            this.tv.uboat.sprite.dive();
        }
        Object.values(this.tv.gameObjects).forEach(object => {
            object.sprite.setRange(this.range);
        })

        switch (this.range) {
            case "Short Range":
                this.rangeNum = 8;
                if (this.isEscorted()) {
                    this.gm.setEventResolved(false);
                    this.escortDetection(false, 0, true);
                    await until(_ => this.gm.eventResolved == true);
                }
                break;
            case "Medium Range":
                this.rangeNum = 7;
                break;
            case "Long Range":
                this.rangeNum = 6;
                break;
        }

        if (!this.wasDetectedAtCloseRange) {
            //Allow for firing (selecting target and tubes) and wait
            this.tv.setFiringMode(true);
            this.gm.setEventResolved(false);
            await until(_ => this.gm.eventResolved == true);

            //Resolve fired weapons in this round then display results --- leads into escort detection or engaging again or following
            this.gm.setEventResolved(false);
            this.resolveUboatAttack();
            await until(_ => this.gm.eventResolved == true);
        }

        if (this.isEscorted()) {
            if (this.depth == "Surfaced") {
                this.tv.uboat.sprite.dive();
                this.depth = "Periscope Depth";
            }
            this.gm.setEventResolved(false);
            this.escortDetection(false, 0, false);
            await until(_ => this.gm.eventResolved == true);
        }

        this.endRound();

        //Second attack round, if not escorted and has a weapon that can engage
        if (this.hasSinkableShip() && this.canAttack() && !this.isEscorted() && !this.wasDetectedAtCloseRange) {
            //Allow for firing (selecting target and tubes) and wait
            this.tv.setFiringMode(true);
            this.gm.setEventResolved(false);   
            await until(_ => this.gm.eventResolved == true);

            this.resolveUboatAttack();
            await until(_ => this.gm.eventResolved == true);
            this.endRound();
        }
        //Third attack round, if not escorted and has a weapon that can engage- also on surface
        if (this.hasSinkableShip() && this.canAttack() && !this.isEscorted() && this.depth == "Surfaced" && !this.wasDetectedAtCloseRange) {
            //Allow for firing (selecting target and tubes) and wait
            this.tv.setFiringMode(true);
            this.gm.setEventResolved(false);  
            await until(_ => this.gm.eventResolved == true);

            this.resolveUboatAttack();
            await until(_ => this.gm.eventResolved == true);
            this.endRound();
        }

        if (this.hasSinkableShip() || this.encounterType == "Convoy") {
            //Need to get input from player to see if attack will continue, follow, or leave
            //FOLLOW FLOW
            //First determine if player WANTS to follow
            this.gm.setEventResolved(false);
            var followPrompt = new FollowPopup(this.tv, this.gm, this);
            await until(_ => this.gm.eventResolved == true);

            var followChoice = followPrompt.getOption();
            var shipToFollow = null;
            var action = "";

            if (followChoice == "Ignore") {
                action = followChoice;
            }
            else if (followChoice == "Convoy") {
                var followRoll = d6Roll();
                if (followRoll <= 4) {
                    action = "Convoy";
                }
                else {
                    action = "Lost Convoy";
                }
            }
            else {
                switch (followChoice) {
                    case "Ship0":
                        shipToFollow = this.shipList[0];
                        break;
                    case "Ship1":
                        shipToFollow = this.shipList[1];
                        break;
                    case "Ship2":
                        shipToFollow = this.shipList[2];
                        break;
                    case "Ship3":
                        shipToFollow = this.shipList[3];
                        break;
                    case "Ship4":
                        shipToFollow = this.shipList[4];
                        break;
                }
                //Check first if capital ship and undamaged
                if (shipToFollow.getType() == "Capital Ship" && shipToFollow.damage == 0) {
                    action = "Lost - Can't Follow";
                }
                //If following a ship
                else {
                    //Check to see if aircraft or escort shows up (additional round roll)
                    if (!this.isEscorted()) {
                        var roll = d6Rollx2();
                        if (year == 1942) {roll = roll - 1;}
                        if (year == 1943) {roll = roll - 2;}
                        if (roll <= 3) {
                            //escort shows up
                            var newShipList = [];
                            var esc = new Ship(this.gm, "Escort", this.gm.date_month, this.gm.date_year, this.gm.shipsSunk, this.gm.currentOrders);
                            newShipList.push(esc);
                            newShipList.push(shipToFollow);
                            this.shipList = newShipList;
                            action = "Ship";
                        }
                        else if (roll <= 5) {
                            //aircraft encounter
                            console.log("TODO AIRCRAFT");
                            action = "Ship"; //!!!!!!!!!!!!!!!
                        }
                        //No escort / aircraft show up, start attack flow again
                        else {
                            action = "Ship";
                        }
                    }
                    //Escorted
                    else {
                        var roll = d6Roll();
                        //Stays Escorted
                        if (roll <= 4 || shipToFollow.damage == 0) {
                            var newShipList = [];
                            newShipList.push(this.shipList[0]);
                            newShipList.push(shipToFollow);
                            this.shipList = newShipList;
                            action = "Ship + Escort";
                        }
                        //Escort leaves / unescorted
                        else {
                            var newShipList = [];
                            newShipList.push(shipToFollow);
                            this.shipList = newShipList;
                            action = "Ship";
                        }
                    }
                }
            }
            
            switch (action) {
                case "Ignore":
                    this.endEncounter();
                    break;
                case "Lost Convoy":
                    this.follow = " Attempted to follow convoy, but lost contact.";
                    this.endEncounter();
                    break;
                case "Lost":
                    this.follow = " Attempted to follow ship, but lost contact.";
                    this.endEncounter();
                    break;
                case "Lost - Can't Follow":    //for Capital Ships
                    this.follow = " Attempted to follow " + this.shipList[1].getName() + ", but lost her.";
                    this.endEncounter();
                    break;
                case "Convoy":    //attack 4 new ships convoy
                    this.tv.enterReloadMode();
                    this.shipList = this.getShips("Convoy");
                    if (this.depth != "Surfaced") {
                        this.tv.uboat.sprite.surface();
                    }
                    postFollowStatsClear("Periscope Depth");
                    this.start("Convoy");
                    return;
                case "Ship":
                    this.tv.changeScene("Ship", this.timeOfDay, this, false);
                    this.tv.enterReloadMode();
                    this.gm.setEventResolved(false);
                    this.timeOfDay = this.getTimeOfDay(true);
                    await until(_ => this.gm.eventResolved == true);
                    if (this.depth != "Surfaced") {
                        this.tv.uboat.sprite.surface();
                    }
                    this.tv.changeScene("Ship", this.timeOfDay, this, true);
                    postFollowStatsClear("Surfaced");
                    this.attackFlow(false);
                    return;
                case "Ship + Escort":
                    this.tv.changeScene("Ship + Escort", this.timeOfDay, this, false);
                    this.tv.enterReloadMode();
                    this.gm.setEventResolved(false);
                    this.timeOfDay = this.getTimeOfDay(true);
                    await until(_ => this.gm.eventResolved == true);
                    if (this.depth != "Surfaced") {
                        this.tv.uboat.sprite.surface();
                    }
                    this.tv.changeScene("Ship + Escort", this.timeOfDay, this, true);
                    postFollowStatsClear("Periscope Depth");
                    this.attackFlow(false);
                    return;
                default:
                    console.log("DEFAULT - ERROR");
            }
        }
        else {
            this.endEncounter();
        }

    }

    //Starts attack from aircraft
    async aircraftFlow() {
        let a1Roll = d6Rollx2();   //roll on A1 chart
        let year = this.gm.getYear();

        //modifiers
        let mods = 0;
        if (this.sub.isCrewKnockedOut()) {
            mods -= 1;
        }
        if (this.sub.getCrewLevel("Crew") == "Green") {
            mods -= 1;
        }
        else if (this.sub.getCrewLevel("Crew") == "Elite") {
            mods += 1;
        }
        if (this.sub.getSystemStatus("Dive Planes") == "Damaged" || this.sub.getSystemStatus("Dive Planes") == "Inoperative") {
            mods -= 1;
        }
        if (this.sub.getType() == "VIID" || this.sub.getType().includes("IX")){
            mods -=1;
        }
        if (year == 1939) {
            mods += 1;
        }
        else if (year == 1942) {
            mods -= 1;
        }
        else if (year == 1943) {
            mods -= 2;
        }
        if (this.currentBoxName == "Mission") {
            mods -= 1;
        }

        //Check results
        let result = mods + a1Roll;
        let result2 = "";
        console.log("Aircraft Roll: " + result);
        if (result >= 6) {
            //Crash Dive successful, avoids air attack
            console.log("Successful Dive");
        }
        else if (result >= 2) {
            //1 Attack on E3 + 1 Crew Injury
            let hitCount = this.escortAndAirAttackRoll(false, false, true);
            result = this.sub.damage(hitCount, "Aircraft");
            result2 = this.sub.crewInjury("Aircraft");
            console.log(result);
        }
        else {
            //1 Attack on E3*extra mod* + 1 Injury (and a second attack if flak did not down plane)
            let hitCount = this.escortAndAirAttackRoll(false, false, true);
            result = this.sub.damage(hitCount, "Aircraft");
            result2 = this.sub.crewInjury("Aircraft");
            console.log(result);
        }

        flakResult = this.flakAttack();

        //Fire Flak if sub did not dive fast enough
        //if did not dive and aircraft is still alive and result is 1 or less, resolve second attack on E3
        //Ship dives
        //if aircraft damaged, attack complete
        //else, roll on additional round E1
    }

    //Clean up after firings
    endRound() {
        this.clearRoundStats();
        for (let i = 0; i < this.shipList.length; i++) {
            this.shipList[i].clearRoundStats();
        }
        if (this.depth == "Deep") {
            this.depth = "Periscope Depth";
        }
    }

    //Resets flags and attack parameters to start-of-encounter
    postFollowStatsClear(depth) {
        this.attackDepth = "";
        this.depth = depth;               //Surfaced, Periscope Depth, or Deep
        this.range = "";               //Close, Medium, or Long
        this.rangeNum = 0;             //8, 7, 6
        this.canFireForeAndAft = false;
        this.firedForeAndAft = false;
        this.firedFore = false;
        this.firedAft = false;
        this.firedDeckGun = false;
        this.firedG7a = false;
        this.wasDetected = false;
        this.wasDetectedAtCloseRange = false;
    }

    /**NOT USED
     * resetEncounter(followChoice) {
        if (this.depth != "Surfaced") {
            this.tv.uboat.sprite.surface();
        }
        this.attackFlow();
    }*/ 

    endEncounter() {
        this.tv.changeScene("", this.timeOfDay, null, false);
        if (this.depth != "Surfaced") {
            this.tv.uboat.sprite.surface();
        }
        this.tv.finishEncounter();
        //Prompt for reloads if torpedoes were fired
        if (this.numFired > 0 || this.currentBoxName == "Mission") {
            if (this.gm.currentOrders.includes("Minelaying")) {
                this.sub.deployMines();
                this.tv.mainUI.forceTorpedoButtonUpdate();
            }
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
            var FTpopup = new FollowTimePopup(this.tv, this.gm, this);
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

    //Enter firing mode to allow for target selection and weapon selection
    enterFiringMode() {
        //Allow for firing (selecting target and tubes)
        this.tv.setFiringMode(true);

        //Await for at least one type of firing before moving on
        this.gm.setEventResolved(false);
    }

    //Resolves damage and then displays results in popup
    resolveUboatAttack() {
        this.tv.setFiringMode(false);
        if (this.sub.isFiringDeckGun > 0) {
            this.resolveDeckGun(this.sub.isFiringDeckGun);
            this.firedDeckGun = true;
        }
        else {
            this.resolveTorpedoes();
        }
        this.attackDepth = this.depth;
        this.sub.fire();

        this.gm.setEventResolved(false);
        var roundResults = new RoundResultsPopup(this.tv, this.gm, this);
    }

    resolveDeckGun(numShots) {
        //Performed for each shot
        for (let i = 0; i < this.shipList.length; i++) {
            while (this.shipList[i].deckGunINCOMING > 0) {
                var gunRoll = d6Rollx2();
                var rollMod = 0;

                //Apply mods
                if (this.sub.knightsCross >= 2){
                    rollMod -= 1;
                }
                if (this.sub.crew_levels["Crew"] == 0) {
                    rollMod += 1;
                }
                if (this.sub.isCrewKnockedOut()) {
                    rollMod += 1;
                }
                if (this.sub.crew_health["Kommandant"] > 1) {
                    if (this.sub.sub.crew_health["Watch Officer"] > 1) {
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
                    if (this.sub.getType().includes("IX")) {
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
            if (this.sub.tubeFiring[i] == true) {
                this.firedFore = true;
                break;
            }
        }
        //Check aft tubes
        for (let i = 5; i < 7; i++) {
            if (this.sub.tubeFiring[i] == true) {
                this.firedAft = true;
                break;
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
                if (this.sub.knightsCross >= 2) {
                    rollMod -= 1;
                }
                if (this.sub.getCrewLevel("Crew") == "Green") {
                    rollMod += 1;
                }
                if (this.sub.isCrewKnockedOut()) {
                    rollMod += 1;
                }
                if (this.sub.getCrewHealth("Kommandant") == "SW") {
                    if (this.sub.getCrewHealth("Watch Officer 1") == "SW") {
                        rollMod += 1;
                    }
                    rollMod += 1;
                }
                if (this.sub.isFiringForeAndAft && this.sub.knightsCross == 0) {
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
        console.log("All torpedoes resolved.");
    }

    clearRoundStats() {
        this.roundHits = 0;
        this.roundDuds = 0;
        this.roundDam = 0;
        this.roundFired = 0;
        this.round++;
        this.roundTookFlooding = false;
    }

    //Determines if a combat round can be conducted
    canAttack(){
        var canFireFore = true;
        var canFireAft = true;
        var canFireDeckGun = true;
        
        if (!this.sub.canFire("Fore") || this.firedFore || this.firedForeAndAft) {
            canFireFore = false;
        }
        if (!this.sub.canFire("Aft") || this.firedAft || this.firedForeAndAft) {
            canFireAft = false;
        }
        if (this.isEscorted() || !this.sub.canFire("Deck Gun") || this.firedDeckGun) {
            canFireDeckGun = false;
        }

        if (canFireFore || canFireAft || canFireDeckGun) {
            return true;
        }
        else {
            return false;
        }
    }

    //Gets the choice from the player on what to follow, then checks if possible, rolls, etc
    //Returns string
    //NOT USED------------
    async followCheck() {
        //First determine if player WANTS to follow
        this.gm.setEventResolved(false);
        var followPrompt = new FollowPopup(this.tv, this.gm, this);
        await until(_ => this.gm.eventResolved == true);

        var followChoice = followPrompt.getOption();
        var shipToFollow = null;

        if (followChoice == "Ignore") {
            return followChoice;
        }
        else if (followChoice == "Convoy") {
            var followRoll = d6Roll();
            if (followRoll <= 4) {
                return "Convoy";
            }
            else {
                return "Lost Convoy";
            }
        }
        else {
            switch (followChoice) {
                case "Ship0":
                    shipToFollow = this.shipList[0];
                    break;
                case "Ship1":
                    shipToFollow = this.shipList[1];
                    break;
                case "Ship2":
                    shipToFollow = this.shipList[2];
                    break;
                case "Ship3":
                    shipToFollow = this.shipList[3];
                    break;
                case "Ship4":
                    shipToFollow = this.shipList[4];
                    break;
            }
        }

        //Check first if capital ship and undamaged
        if (shipToFollow.getType() == "Capital Ship" && shipToFollow.damage == 0) {
            return "Lost - Can't Follow";
        }
        //If following a ship
        else {
            //Check to see if aircraft or escort shows up (additional round roll)
            if (!this.isEscorted()) {
                var roll = d6Rollx2();
                if (year == 1942) {roll = roll - 1;}
                if (year == 1943) {roll = roll - 2;}
                if (roll <= 3) {
                    //escort shows up
                    var newShipList = [];
                    var esc = new Ship(this.gm, "Escort", this.gm.date_month, this.gm.date_year, this.gm.shipsSunk, this.gm.currentOrders);
                    newShipList.push(esc);
                    newShipList.push(shipToFollow);
                    this.shipList = newShipList;
                    return "Ship";
                }
                else if (roll <= 5) {
                    //aircraft encounter
                    console.log("TODO AIRCRAFT");
                    return "Ship"; //!!!!!!!!!!!!!!!
                }
                //No escort / aircraft show up, start attack flow again
                else {
                    return "Ship";
                }
            }
            //Escorted
            else {
                var roll = d6Rollx2();
                //Escort leaves
                if (roll >= 5) {
                    var newShipList = [];
                    newShipList.push(shipToFollow);
                    this.shipList = newShipList;
                    return "Ship";
                }
                //Stays Escorted
                else {
                    var newShipList = [];
                    newShipList.push(this.shipList[0]);
                    newShipList.push(shipToFollow);
                    this.shipList = newShipList;
                    return "Ship + Escort";
                }
            }
            //return shipToFollow;   ??
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
        await until(_ => this.subEventResolved == true);

        //Check if in Wolfpack - only checked once if wolfpack. Otherwise stays 0
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
        if (this.sub.knightsCross >= 3) {
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
            if (this.sub.crew_health["Kommandant"] >= 2 && this.sub.crew_health["Watch Officer 1"] >= 2) {
                escortMods += 2;
            }
            else if (this.sub.crew_health["Kommandant"] == 2) {
                escortMods += 1;
            }
            if (this.sub.systems["Fuel Tanks"] > 0) {
                escortMods += 1;
            }
            if (this.sub.systems["Dive Planes"] > 0) {
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

        var results = "";
        var majorDetection = false;
        if (escortRoll == 2) {
            results = "Completely Undetected";
        }
        else if (escortRoll + escortMods <= 8) {
            results = "Undetected";
        }
        else if (escortRoll + escortMods <= 11) {
            results = "Detected";
        }
        else if (escortRoll + escortMods >= 12) {
            results = "Detected";
            majorDetection = true;
        }

        //Show if detected or not popup
        this.gm.setSubEventResolved(false);
        escortDetectionPopup.escortResults(results, majorDetection)
        await until(_ => this.subEventResolved == true);

        //Show damage results popup
        if (results == "Detected") {
            let nightSurfaceAttackFirstRound = false;
            if (this.attackDepth == "Surfaced" && this.timeOfDay == "Night" && !previouslyDetected){
                nightSurfaceAttackFirstRound = true;
            }
            if (closeRangeCheck) {
                this.wasDetectedAtCloseRange = true;
            }
            this.gm.setSubEventResolved(false);
            if (majorDetection) {
                this.wasDetected = true;
                let hitCount = this.escortAndAirAttackRoll(nightSurfaceAttackFirstRound, true, false);
                results = this.sub.damage(hitCount, "Depth Charges");
            }
            else {
                let hitCount = this.escortAndAirAttackRoll(nightSurfaceAttackFirstRound, true, false);
                results = this.sub.damage(hitCount, "Depth Charges");
            }
            escortDetectionPopup.damageResults(results, majorDetection)
            await until(_ => this.subEventResolved == true);

            //If detected, check detection again
            this.depth = "Periscope Depth";  //reset depth (in case "Deep" was selected)
            this.escortDetection(true, wpMod, false);
        }
        else {
            this.gm.setEventResolved(true);
        }
    }

    /**
     * E3 chart for rolling # of hits following a detection
     * @param {boolean} nightSurfaceAttackFirstRound 
     * @param {boolean} majorDetection 
     * @param {boolean} airAttack 
     * @returns int of number of hits on the sub following an escort / air attack
     */
    escortAndAirAttackRoll(nightSurfaceAttackFirstRound, majorDetection, airAttack) {
        let e3roll = d6Rollx2();
        let mods = 0;

        if (this.sub.getSystemStatus("Fuel Tanks") != "Operational") {
            mods += 1;
        }
        if (this.sub.getSystemStatus("Hydrophone") != "Operational") {
            mods += 1;
        }
        if (this.sub.getSystemStatus("Batteries") != "Operational") {
            mods += 1;
        }
        if (this.sub.getSystemStatus("Electric Engine #1") != "Operational") {
            mods += 1;
        }
        if (this.sub.getSystemStatus("Electric Engine #2") != "Operational") {
            mods += 1;
        }
        if (nightSurfaceAttackFirstRound) {
            mods += 1;
        }
        if (majorDetection) {
            mods += 1;
        }
        if (this.gm.getYear() == 1943) {
            mods += 1;
        }
        if (airAttack) {
            mods += 2;
        }

        result = e3roll + mods;

        switch (result) {
            case 2:
            case 3:
                return 0;
            case 4:
            case 5:
            case 6:
                return 1;
            case 7:
            case 8:
                return 2;
            case 9:
            case 10:
                return 3;
            case 11:
                return 4;
            case 12:
                return 5;
            default:
                console.log("GAME OVER");
                return 20; //TODO FIX
        }
    }

    /**
     * A2 Chart roll for flak attacks following an aircraft attack
     * @returns String of roll result ("Shot Down", "Damaged", or "Miss")
     */
    flakAttack() {
        let a2roll = d6Rollx2();
        let mods = 0;

        if (this.sub.getType() == "VIIA") {
            mods += 1;
        }
        if (this.sub.getType().includes("IX") && this.getSystemStatus("3.7 Flak") == "Functional") {
            mods -= 1;
        }
        if (this.sub.crew_levels("Crew") >= 2) {
            mods -= 1;
        }
        //TODO for Flak (if it is ever added) bonus (-2)

        result = a2roll + mods;
        if (result <= 3) {
            return "Shot Down";
        }
        else if (result <= 5) {
            return "Damaged";
        }
        else {
            return "Miss";
        }
    }
}