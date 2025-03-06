class Uboat{
    constructor(type, tv, gm){
        this.subClass = type;
        this.tv = tv;
        this.gm = gm;

        //-----SUBSYSTEM STATES
        // states are: 0=operational, 1=damaged, 2=inoperative
        this.systems = {
            "Electric Engine #1": 0,
            "Electric Engine #2": 0,
            "Diesel Engine #1": 0,
            "Diesel Engine #2": 0,
            "Periscope": 0,
            "Radio": 0,
            "Hydrophones": 0,
            "Batteries": 0,
            "Forward Torpedo Doors": 0,
            "Aft Torpedo Doors": 0,
            "Dive Planes": 0,
            "Fuel Tanks": 0,
            "Deck Gun": 0,
            "Flak Gun": 0,
            "3.7 Flak": 0
        }

        //---------------Tubes 1-6 (0=empty, 1=G7a, 2=G7e, 3=Mines)
        this.tube = [null, 0, 0, 0, 0, 0, 0]
        this.tubeFiring = [null, false, false, false, false, false, false]
        this.isFiringTorpedoes = false;
        this.isFiringFore = false;
        this.isFiringAft = false;
        this.isFiringForeAndAft = false;
        this.isFiringDeckGun = 0;  //num of shots deck gun is firing this round

        //set type-specific values for u-boat
        switch (this.subClass){
            case "VIIA":
                this.patrol_length = 3;                      // number of spaces during patrols
                this.hull_hp = 7;                            // total hull damage before sinking
                this.flooding_hp = 7;                        // total flooding damage before surfacing
                this.G7aStarting = 6;                        // default load of G7a steam torpedoes
                this.G7eStarting = 5;                        // default load of G7e electric torpedoes
                this.forward_tubes = 4;                      // number of forward torpedo tubes
                this.aft_tubes = 1;                          // number of aft torpedo tubes
                this.torpedo_type_spread = 1;                // plus/minus of steam / electric torpedo mix
                this.deck_gun_ammo = 10;                     // current ammo for deck gun
                this.deck_gun_cap = 10;                      // sub's deck gun ammo capacity
                this.reserves_aft = 0;                       // number of aft torpedo reloads
                this.systems["3.7 Flak"] = -1;               // large (3.7) flak (-1 means not present)
                this.tube[6] = null;                         // tube 6 (second aft tube)
                this.tubeFiring[6] = null;
                break;
            case "VIIB":
            case "VIIC":
                this.patrol_length = 4;  
                this.hull_hp = 8;  
                this.flooding_hp = 8; 
                this.G7aStarting = 8; 
                this.G7eStarting = 6;  
                this.forward_tubes = 4;  
                this.aft_tubes = 1;
                this.torpedo_type_spread = 3;
                this.deck_gun_ammo = 10;
                this.deck_gun_cap = 10;
                this.reserves_aft = 1;
                this.systems["3.7 Flak"] = -1;
                this.tube[6] = null; 
                this.tubeFiring[6] = null;
                break;
            case "IXA":
                this.patrol_length = 5;  
                this.hull_hp = 8;  
                this.flooding_hp = 8; 
                this.G7aStarting = 12; 
                this.G7eStarting = 10;  
                this.forward_tubes = 4;  
                this.aft_tubes = 2;
                this.torpedo_type_spread = 4;
                this.deck_gun_ammo = 5;
                this.deck_gun_cap = 5;
                this.reserves_aft = 2;
                this.systems["3.7 Flak"] = 0;
                this.tube[6] = 0; 
                this.tubeFiring[6] = false;
                break;
            case "IXB":
                this.patrol_length = 6;  
                this.hull_hp = 8;  
                this.flooding_hp = 9; 
                this.G7aStarting = 12; 
                this.G7eStarting = 10;  
                this.forward_tubes = 4;  
                this.aft_tubes = 2;
                this.torpedo_type_spread = 4;
                this.deck_gun_ammo = 5;
                this.deck_gun_cap = 5;
                this.reserves_aft = 2;
                this.systems["3.7 Flak"] = 0;
                this.tube[6] = 0;
                this.tubeFiring[6] = false;
                break;
            case "IXC":
                this.patrol_length = 7;  
                this.hull_hp = 9;  
                this.flooding_hp = 9; 
                this.G7aStarting = 12; 
                this.G7eStarting = 10;  
                this.forward_tubes = 4;  
                this.aft_tubes = 2;
                this.torpedo_type_spread = 4;
                this.deck_gun_ammo = 5;
                this.deck_gun_cap = 5;
                this.reserves_aft = 2;
                this.systems["3.7 Flak"] = 0;
                this.tube[6] = 0;
                this.tubeFiring[6] = false;
                break;
            case "VIID":
                this.patrol_length = 5;  
                this.hull_hp = 8;  
                this.flooding_hp = 8; 
                this.G7aStarting = 8; 
                this.G7eStarting = 6;  
                this.forward_tubes = 4;  
                this.aft_tubes = 1;
                this.torpedo_type_spread = 3;
                this.deck_gun_ammo = 10;
                this.deck_gun_cap = 10;
                this.reserves_aft = 1;
                this.systems["3.7 Flak"] = -1;
                this.tube[6] = null;
                this.tubeFiring[6] = null;
                break;
            }
        this.reserves_fore = this.G7aStarting + this.G7eStarting - this.reserves_aft - this.aft_tubes;
        this.G7a = 0;
        this.G7e = 0;

        //--------------- AMMUNITION (What's in what tube) and overall damage indicators
        this.hull_Damage = 0;                        // current amount of hull damage
        this.flooding_Damage = 0;                    // current amount of flooding
        this.forward_G7a = 0;                        // number of loaded G7a torpedoes (fore)
        this.forward_G7e = 0;                        // number of loaded G7e torpedoes (fore)
        this.aft_G7a = 0;                            // number of loaded G7a torpedoes (aft)
        this.aft_G7e = 0;                            // number of loaded G7e torpedoes (aft)
        this.reloads_forward_G7a = 0;                // number of reloads forward of G7a
        this.reloads_forward_G7e = 0;                // number of reloads forward of G7e
        this.reloads_aft_G7a = 0;                    // number of reloads aft of G7a
        this.reloads_aft_G7e = 0;                    // number of reloads aft of G7e
        this.minesLoadedForward = false;
        this.minesLoadedAft = false;

        //-------Last Loadout Settings
        this.lastLoadoutForward_G7a = 0;            //last loadouts for remembering the last chosen torpedo choices
        this.lastLoadoutForward_G7e = 0;
        this.lastLoadoutAft_G7a = 0;
        this.lastLoadoutAft_G7e = 0;
        this.lastLoadoutReloads_forward_G7a = 0;
        this.lastLoadoutReloads_forward_G7e = 0;
        this.lastLoadoutReloads_aft_G7a = 0;
        this.lastLoadoutReloads_aft_G7e = 0;
        this.numTorpedoesLoaded = 0;

        //Damage chart (for rolling damage against U-boat)
        this.damageChart = ["Batteries", "flooding", "crew injury", "Periscope", "Dive Planes", "Electric Engine #1",
                            "flooding", "Electric Engine #2", "Diesel Engine #1", "Flak Guns", "Diesel Engine #2",
                            "3.7 Flak", "flooding", "minor", "hull", "crew injury", "hull", "Deck Gun",
                            "hull", "Radio", "flooding", "flooding", "hull", "Flak Gun",
                            "flooding", "hull", "crew injury", "floodingx2", "hull", "Deck Gun",
                            "Hydrophones", "Aft Torpedo Doors", "crew injuryx2", "Forward Torpedo Doors", "hullx2",
                            "Fuel Tanks"];

        //-------------CREW TRAINING LEVELS / RANKS
        //levels for individual crew members are 0=normal, 1=trained/expert
        //levels for kmdt are 0 = Oberleutnant zur See, 1 = Kapitan-leutnant, 2 = Fregatten-kapitan, 3 = Kapitan zur See
        //levels for regular crew are 0 = green, 1 = trained, 2 = Veteran, 3 = Elite

        this.crew_levels = {
            "Crew": 1,
            "Watch Officer 1": 0,
            "Watch Officer 2": 0,
            "Engineer": 0,
            "Doctor": 0,
            "Kommandant": 0
        };

        //-------------CREW STATES
        //states are 0 = OK, 1 = LW, 2 = SW, 3 = KIA • -1 indicates not present
        this.crew_health = {
            "Crew 1": 0,
            "Crew 2": 0,
            "Crew 3": 0,
            "Crew 4": 0,
            "Watch Officer 1": 0,
            "Watch Officer 2": 0,
            "Engineer": 0,
            "Doctor": 0,
            "Kommandant": 0,
            "Abwehr Agent": -1
        };

        //Knight's Cross decoration level
        //  0 = none
        //  1 = KC =   Knight's Cross (sink 100k GRT or sink 1 capital ship) - no +1 penalty for firing fore and aft salvo
        //  2 = KCO=   Knight's Cross & Oakleaves (Sink 175k GRT OR sink 1 capital ship after being given KC OR sink 75k GRT after being given GC)
        //  3 = KCO&S= Knight's Cross Oakleaves & Swords (Sink 250k GRT, OR sink 1 capital ship after being given KCO, or sink 75k GRT after being given GCO)
        //  4 = KCOS&D=Knight's Cross Oakleaves, Swords and Diamonds (Sink 300k GRT, sink 1 capital ship after being given KCO&S or sink 50k GRT after being given GCO&S
        this.knightsCross = 0;

        //Other States-----
        this.depth = 0;   //0=surfaced, 1=attack depth, 2=deep
    }

    /**
     * 
     * @returns string of subclass (VIIA, VIIB, VIIC, VIID, IXA, IXB, IXC)
     */
    getType(){
        return this.subClass;
    }

    /**
     * Returns the NAME (Green, Trained, Veteran, Elite) of the current crewman skill level
     * @param {string} crewman 
     */
    getCrewLevel(crewman) {
        switch (this.crew_levels[crewman]) {
            case 0:
                return "Green";
            case 1:
                return "Trained";
            case 2:
                return "Veteran";
            case 3:
                return "Elite";
        }
    }
    
    /**
     * Gets the health status of the crew member
     * @param {string} crewman 
     * @returns string (OK, LW, SW, or KIA)
     */
    getCrewHealth(crewman) {
        switch (this.crew_health[crewman]) {
            case 0:
                return "OK";
            case 1:
                return "LW";
            case 2:
                return "SW";
            case 3:
                return "KIA";
        }
    }

    /**
     * Returns the status (Operational, Damaged, Inoperative) of the given system
     * @param {string} system 
     */
    getSystemStatus(system) {
        switch (this.systems[system]) {
            case 0:
                return "Operational";
            case 1:
                return "Damaged";
            case 2:
                return "Inoperative";
        }
    }

    torpedoResupply(){
        //Called in port to allow user to select torpedoes to load given the spread parameters

        this.forward_G7a = 0;
        this.forward_G7e = 0;
        this.aft_G7a = 0;
        this.aft_G7e = 0;
        this.reloads_forward_G7a = 0;
        this.reloads_forward_G7e = 0;
        this.reloads_aft_G7a = 0;
        this.reloads_aft_G7e = 0;
        //this.minesLoadedForward = true
        //this.minesLoadedAft = true

        let aftReserves = this.reserves_aft + this.aft_tubes;
        let G7aReservesToStart = Math.ceil(aftReserves / 2);
        let G7eReservesToStart = aftReserves - G7aReservesToStart;

        const subResupply = new ResupplyPopup(this.tv, this.gm, this.G7aStarting, this.G7eStarting, G7aReservesToStart, G7eReservesToStart);

        //set loadout to remember for next resupply
        this.lastLoadoutForward_G7a = this.forward_G7a;
        this.lastLoadoutForward_G7e = this.forward_G7e;
        this.lastLoadoutAft_G7a = this.aft_G7a;
        this.lastLoadoutAft_G7e = this.aft_G7e;
        this.lastLoadoutReloads_forward_G7a = this.reloads_forward_G7a;
        this.lastLoadoutReloads_forward_G7e = this.reloads_forward_G7e;
        this.lastLoadoutReloads_aft_G7a = this.reloads_aft_G7a;
        this.lastLoadoutReloads_aft_G7e = this.reloads_aft_G7e;
    }

    /**
     * Checks if any tubes are empty that can be loaded.
     * @returns true if at least one tube at fore is empty and can be loaded, or at least one tube at aft is empty and can be loaded
     */
    tubesLoadedCheck() {
        let startTubeToCheck = 1;           //First tube to check. Default is 1 (start at first tube)
        let endTubeToCheck = 7;             //Last tube to check. Default is 7 (check all tubes 1-6)
        
        //loop through relevant tubes
        for (let i = startTubeToCheck; i < endTubeToCheck; i++){
            if (this.tube[i] === 0){
                if (i < 5 && (this.reloads_forward_G7a > 0 || this.reloads_forward_G7e > 0)) {
                    return true;
                }
                else if (i > 4 && (this.reloads_aft_G7a > 0 || this.reloads_aft_G7e > 0)){
                    return true;
                }

            }
        }
        return false;
    }

    loadTube(tubeNum, type){
        //loads a tube with a given torpedo type, checking to make sure the stores are available

        if (tubeNum <= 4){   //trying to load fore torpedoes
            if (type == 1 && this.reloads_forward_G7a > 0){
                if (this.tube[tubeNum] == 2){  //unload existing G7e if not empty (add back to fore G7e reserves)
                    this.reloads_forward_G7e++;
                }
                this.reloads_forward_G7a--;
                this.tube[tubeNum] = type;
            }
            else if (type == 2 && this.reloads_forward_G7e > 0){
                if (this.tube[tubeNum] == 1){  //unload existing G7a if not empty (add back to fore G7a reserves)
                    this.reloads_forward_G7a++;
                }
                this.reloads_forward_G7e--;
                this.tube[tubeNum] = type;
            }
            else {
                //console.log("No Torpedoes available of that type to load forward.")
            }
        }
        else {  //trying to load aft torpedoes
            if (type == 1 && this.reloads_aft_G7a > 0){
                if (this.tube[tubeNum] == 2){  //unload existing G7e if not empty (add back to aft G7e reserves)
                    this.reloads_aft_G7e++;
                }
                this.reloads_aft_G7a--;
                this.tube[tubeNum] = type;
            }
            else if (type == 2 && this.reloads_aft_G7e > 0){
                if (this.tube[tubeNum] == 1){  //unload existing G7a if not empty (add back to aft G7a reserves)
                    this.reloads_aft_G7a++;
                }
                this.reloads_aft_G7e--;
                this.tube[tubeNum] = type;
            }
            else {
                //console.log("No Torpedoes available of that type to load aft.")
            }
        }
    }

    torpedoReload(G7aToLoadFore, G7eToLoadFore, G7aToLoadAft, G7eToLoadAft){
        //determine tubes that need loading
        var tubesNeedingReload = 0;
        for (let i = 0; i < 7; i++){
            if (this.tube[i] === 0){
                tubesNeedingReload++;
            }
        }

        if (G7aToLoadFore + G7eToLoadFore + G7aToLoadAft + G7eToLoadAft !== tubesNeedingReload){
            console.log("Error, torpedoes to load does not match empty tubes.");
        }

        for (let i = 0; i < 7; i++){
            if (this.tube[i] === 0){
                if (G7aToLoadFore > 0){
                    G7aToLoadFore--;
                    this.tube[i] = 1;
                }
                else if (G7eToLoadFore > 0){
                    G7eToLoadFore--;
                    this.tube[i] = 2;
                }
                else if (G7aToLoadAft > 0){
                    G7aToLoadAft--;
                    this.tube[i] = 1;
                }
                else if (G7eToLoadAft > 0){
                    G7eToLoadAft--;
                    this.tube[i] = 2;
                }
                else {
                    console.log("Error loading into tube" + i);
                }
            }
            console.log("Tube #" + i + ": " + this.tube[i]);
        }
    }

    /**
     * Changes all current tubes to mines.
     */
    loadMines() {
        for (let i = 1; i < 5 + this.aft_tubes; i++){
            this.tube[i] = 3;
        }
        if (this.getType().includes("IX")){
            this.tube[6] = 3;
        }
        //unsure if forward and aft type counts are needed anymore
        this.forward_G7a = 0;
        this.forward_G7e = 0;
        this.aft_G7a = 0;
        this.aft_G7e = 0;
        
        this.minesLoadedForward = true;
        this.minesLoadedAft = true;
    }

    /**
     * Removes mines from torpedo tubes following a successful mission, assuming appropriate door is operational.
     */
    deployMines() {
        // deploy forward mines if doors work
        if (this.getSystemStatus("Forward Torpedo Doors") == "Operational") {
            for (let i = 1; i < 5; i++){
                this.tube[i] = 0;
            }
            this.minesLoadedForward = false;
        }
        //deploy aft mines if doors work
        if (this.getSystemStatus("Aft Torpedo Doors") == "Operational") {
            this.tube[5] = 0;
            if (this.getType().includes("IX")){
                this.tube[6] = 0;
            }
            this.minesLoadedAft = false;
        }        
    }

    /**
     * Checks (for abort purposes) # of inoperative diesel engines
     * @returns int of # of inop diesel engines (0-2)
     */
    dieselsInop(){
        var numInOp = 0;
        if (this.systems["Diesel Engine #1"] == 2) {numInOp ++;} 
        if (this.systems["Diesel Engine #2"] == 2) {numInOp ++;}
        return numInOp
    }

    //Returns true if the given weapon has ammo and is functional
    canFire(location) {
        if (location == "Fore") {
            //check first 4 tubes
            for (let i = 1; i < 5; i++) {
                //Check if tube is 1 or 2 (G7a or G7e, not empty or mines)
                if (this.tube[i] > 0 && this.tube[i] < 3 && this.systems["Forward Torpedo Doors"] == 0) {
                    return true;
                }
            }
        }
        else if (location == "Aft") {
            //check rest of tubes after tube 4
            for (let i = 5; i < 7; i++) {
                //Check if tube is 1 or 2 (G7a or G7e, not empty or mines)
                if (this.tube[i] > 0 && this.tube[i] < 3 && this.systems["Aft Torpedo Doors"] == 0) {
                    return true;
                }
            }
        }
        else {
            //check deck gun ammo
            if (this.deck_gun_ammo > 0 && this.systems["Deck Gun"] == 0) {
                return true;
            }
        }
        return false;
    }

    //returns true if the boat has 
    hasAmmo() {

    }

    //Adds (or removes) a torpedo from a given tube
    assignTubeForFiring(tubeNum, type) {
        if (this.tube[tubeNum] == 3) {
            console.log("ERROR - tube has mines");
            return;
        }

        var torp = 0
        if (type == "G7a") {
            torp = 1;
            this.tubeFiring[tubeNum] = true;
        }
        else if (type == "G7e") {
            torp = 2;
            this.tubeFiring[tubeNum] = true;
        }
        else {
            this.tubeFiring[tubeNum] = false;
        }

        this.updateIsFiringTorpedoes();
        this.tv.mainUI.deckGunButton.getLatestState();
    }

    //Updates the firingTorpedoes flag
    updateIsFiringTorpedoes() {
        this.isFiringFore = false;
        this.isFiringAft = false;
        this.isFiringTorpedoes = false;
        for (let i = 0; i < 7; i++) {
            if (this.tubeFiring[i] == true) {
                this.isFiringTorpedoes = true;
                if (i <= 4) {
                    this.isFiringFore = true;
                }
                else if (i >= 5) {
                    this.isFiringAft = true;
                }
            }
        }

        if (this.isFiringFore && this.isFiringAft) {
            this.isFiringForeAndAft = true;
        }
        else {
            this.isFiringForeAndAft = false;
        }
    }

    assignDeckGunForFiring(num) {
        this.isFiringDeckGun = num;
    }

    isFiring() {
        if (this.isFiringDeckGun > 0 || this.isFiringTorpedoes) {
            return true;
        }
        else {
            return false;
        }
    }

    //Empties Tubes and removes deck gun shots as part of the resolve step
    fire() {
        if (this.isFiringDeckGun > 0) {
            this.deck_gun_ammo = this.deck_gun_ammo - this.isFiringDeckGun;
            this.isFiringDeckGun = 0;
        }
        else {
            this.isFiringTorpedoes = false;
            for (let i = 0; i < 7; i++) {
                if (this.tubeFiring[i] == true) {
                    this.tube[i] = 0;
                }
                this.tubeFiring[i] = false;
            }
        }
        this.isFiringFore = false;
        this.isFiringAft = false;
        this.isFiringForeAndAft = false;
        this.isFiringTorpedoes = false;
        this.isFiringDeckGun = false;
    }

    /**
     * Used to check if all 4 generic crew members are SW or Dead
     * @returns true if all 4 generic crew are dead or SW
     */
    isCrewKnockedOut() {
        var numOfKO = 0;
        for (let i = 0; i < 4; i++) {
            if (this.crew_health[i] >= 2) {
                numOfKO++;
            }
            else {
                return false;
            }
        }
        if (numOfKO == 4) {
            return true;
        }
        return false;
    }

    //returns true if given crewman is not wounded, LW, or SW
    isCrewmanAlive(crewman) {
        if (this.gm.sub.crew_health[crewman] < 3) {
            return true;
        }
        else if (this.gm.sub.crew_health[crewman] >= 3){
            return false;
        }
        else {
            console.log("Error getting " + crewman + " health status.");
            return false;
        }
    }

    /**
     * Check if crewman is not wounded or only lightly-wounded
     * @param {string} crewman 
     * @returns returns true if given crewman is not wounded, or LW, false if SW or KIA
     */
    isCrewmanFunctional(crewman) {
        if (this.gm.sub.crew_health[crewman] < 2) {
            return true;
        }
        else if (this.gm.sub.crew_health[crewman] >= 2){
            return false;
        }
        else {
            console.log("Error getting " + crewman + " health status.");
            return false;
        }
    }

    /**
     * When Uboat takes damage
     * @param {int} numHits 
     * @param {string} attack - Type of attack ("Aircraft", "Depth Charges", or "Pressure")
     * @param {string} attacker 
     * @returns String of results of all hits.
     */
    damage(numHits, attack, attacker) {
        this.gm.hitsTaken += numHits;
        var tookFloodingThisRound = false;
        var damage = "";
        var messageToReturn = "";
        if (attack != "Pressure") {
            messageToReturn = numHits + " hits! ";

            if (numHits == 0) {
                messageToReturn = "They missed us! ";
            }
            else if (numHits == 1) {
                messageToReturn = numHits + " hit! ";
            }
            this.gm.currentEncounter.tookDamage = true;
        }

        //Deal with diving deep- if diving deep, bypass damage rolls for attacks below
        if (attack == "Pressure") {
            //Automatically take 1 damage
            this.hull_Damage += 1;
            messageToReturn = "The hull groans as the boat dives further. ";

            //Check for further damage
            let rollingForPressure = true;
            while (rollingForPressure) {
                let pressureRoll = d6Rollx2();
                if (pressureRoll < this.hull_Damage) {
                    //game over
                    let cause = "Sunk " + this.gm.getFullDate();
                    cause += " - Hull catastrophically imploded escaping the " + attacker;
                
                    console.log("GAME OVER: " + cause);
                    const goPopup = new GameOverPopup(this.tv, this.gm, this.gm.currentEncounter, cause);
                }
                else if (pressureRoll == this.hull_Damage) {
                    this.hull_Damage += 1;
                    messageToReturn = messageToReturn + "The hull has taken further pressure from the depths! "
                    continue;
                }
                else {
                    rollingForPressure = false;
                }
            }

            numHits = 0;        //set to 0 hits so for loop following this is skipped
        }

        for (let x = 0; x < numHits; x++) {
            damage = this.damageChart[randomNum(0, 35)];
            //reroll 3.7 Flak for VII type boats
            while (damage == "3.7 Flak" && this.getType().includes("VII")) {
                damage = this.damageChart[randomNum(0, 35)];
            }
            switch (damage) {
                case "crew injury":
                    messageToReturn = messageToReturn + "Injury! ";
                    if (this.gm.halsUndBeinbruch > 0){
                        //deal with hals TODO
                    }
                    messageToReturn += this.crewInjury(attack);
                    break;
                case "crew injuryx2":
                    messageToReturn = messageToReturn + "Two injuries! ";
                    if (this.gm.halsUndBeinbruch > 0){
                        //deal with hals TODO
                    }
                    messageToReturn += this.crewInjury(attack);
                    messageToReturn += " ";
                    messageToReturn += this.crewInjury(attack);
                    break;
                case "flooding":
                    var compartments = ["", "forward compartment", "officer's quarters", "control room", "galley", "diesel engine compartment", "aft compartment"]
                    messageToReturn = messageToReturn + "Hole in the " + compartments[d6Roll()] +"! Flooding! ";
                    if (this.gm.halsUndBeinbruch > 0){
                        //deal with hals TODO
                    }
                    this.flooding_Damage += 1;
                    tookFloodingThisRound = true;
                    break;
                case "floodingx2":
                    var compartments = ["", "Forward Compartment", "Officer's Quarters", "Control Room", "Galley", "Diesel Engine Compartment", "Aft Compartment"]
                    messageToReturn = messageToReturn + "Hole in the " + compartments[d6Roll()] +"! ";
                    messageToReturn = messageToReturn + "A second hole in the " + compartments[d6Roll()] +"! ";
                    if (this.gm.halsUndBeinbruch > 0){
                        //deal with hals TODO
                    }
                    this.flooding_Damage += 2;
                    tookFloodingThisRound = true;
                    break;
                case "hull":
                    messageToReturn = messageToReturn + "The hull has taken damage! ";
                    if (this.gm.halsUndBeinbruch > 0){
                        //deal with hals TODO
                    }
                    this.hull_Damage += 1;
                    break;
                case "hullx2":
                    messageToReturn = messageToReturn + "The hull has taken major damage! ";
                    if (this.gm.halsUndBeinbruch > 0){
                        //deal with hals TODO
                    }
                    this.hull_Damage += 2;
                    break;
                case "Flak Guns":
                    if (this.systems["3.7 Flak"] >= 0) {
                        messageToReturn = messageToReturn + "Both flak guns have been damaged! ";
                        if (this.gm.halsUndBeinbruch > 0){
                            //deal with hals TODO
                        }
                        if (this.systems["3.7 Flak"] != 2) {
                            this.systems["3.7 Flak"] = 1;
                            this.gm.currentEncounter.unrepairedDamage = true;
                            //this.systems.set("3.7 Flak", 1);
                        }
                        if (this.systems["Flak Gun"] != 2) {
                            this.systems["Flak Gun"] = 1;
                            this.gm.currentEncounter.unrepairedDamage = true;
                        }
                    }
                    else {
                        messageToReturn = messageToReturn + "Flak gun has been hit! ";
                        if (this.gm.halsUndBeinbruch > 0){
                            //deal with hals TODO
                        }
                        if (this.systems["Flak Gun"] != 2) {
                            this.systems["Flak Gun"] = 1;
                            this.gm.currentEncounter.unrepairedDamage = true;
                            //this.systems.set("Flak Gun", 1);
                        }
                    }
                    break;
                case "minor":
                    if (attack != "Aircraft") {
                        messageToReturn = messageToReturn + "Depth charges ineffective! No damage. ";
                    }
                    else {
                        messageToReturn = messageToReturn + "Aircraft missed! No damage. ";
                    }
                    break;
                default:
                    //First check if damage is not applicable (Only case I can think of is 3.7 Flak on VII)
                    if (damage == "3.7 Flak" && this.subClass.includes("VII")) {
                        messageToReturn = messageToReturn + "Damage ineffectual! ";
                    }

                    //Check first if system is already damaged or inop
                    if (this.systems[damage] > 0) {
                        if (damage.slice(-1) == "s") {
                            messageToReturn = messageToReturn + "The " + damage + " are already damaged! ";
                        }
                        else {
                            messageToReturn = messageToReturn + "The " + damage + " is already damaged! ";
                        }
                        continue;
                    }
                    if (damage.slice(-1) == "s") {
                        messageToReturn = messageToReturn + "The " + damage + " have taken damage! ";
                        this.gm.currentEncounter.unrepairedDamage = true;
                    }
                    else {
                        messageToReturn = messageToReturn + "The " + damage + " has taken damage! ";
                        this.gm.currentEncounter.unrepairedDamage = true;
                    }
                    if (this.gm.halsUndBeinbruch > 0){
                        //deal with hals TODO
                    }
                    //TODO damageVariation text
                    if (this.systems[damage] != 2) {
                        this.systems[damage] = 1;
                        //this.systems.set(damage, 1);
                    }
                    break;
            }
            
        }

        //check if flooding took place this round and roll for additional flooding chance
        if (tookFloodingThisRound) {
            var addlFlooding = d6Roll();
            var floodingMods = 0;
            if (this.crew_health["Engineer"] >= 2) {
                floodingMods += 1
            }
            else if (this.crew_levels["Engineer"] == 1) {
                floodingMods -= 1
            }

            if (addlFlooding + floodingMods <= 4) {
                messageToReturn = messageToReturn + "Leaks have been patched- no more flooding. ";
            }
            else {
                messageToReturn = messageToReturn + "Leaks weren't contained quickly enough! Additional flooding! ";
                this.flooding_Damage = this.flooding_Damage + 1;
            }
        }

        //check to see if sunk from hull damage
        if (this.hull_Damage > this.hull_hp) {
            let cause = "Sunk " + this.gm.getFullDate();
            if (attack == "Aircraft") {
                cause += " - Hull destroyed from air attack by " + attacker;
            }
            else if (attack == "Pressure") {
                cause += " - Hull crushed by pressure escaping the " + attacker;
            }
            else {
                cause += " - Hull destroyed by depth charges by the " + attacker;
            }
            console.log("GAME OVER: " + cause);
            const goPopup = new GameOverPopup(this.tv, this.gm, this.gm.currentEncounter, cause);
        }

        //check for too much flooding (emergency surface / scuttle)
        if  (this.flooding_Damage > this.flooding_hp) {
            let cause = "Scuttled " + this.gm.getFullDate();
            if (attack == "Aircraft") {
                cause += " - Forced to scuttle from air attack flooding by " + attacker; 
            }
            else {
                cause += " - Forced to surface and scuttle from depth charge damage flooding by the " + attacker;
            }
            console.log("GAME OVER: " + cause);
            const goPopup = new GameOverPopup(this.tv, this.gm, this.gm.currentEncounter, cause);
        }

        return messageToReturn;
    }

    crewInjury(attack) {
        var sevText = "";
        var wounds = 0;
        var toReturn = "";
        var person = "";

        if (attack == "Torpedo Incident") {
            //deal with TI
        } 
        else {
            var crewInjuryRoll = d6Rollx2();
            var severity = d6Roll();
        }
        if (this.gm.sub.crew_health["Doctor"] <= 1 && this.gm.sub.crew_levels["Doctor"] > 0) {
            severity -= 1;
        }
        if (severity <= 3) {
            sevText = "lightly wounded! ";
            wounds = 1;
        }
        else if (severity <= 5) {
            sevText = "severely wounded! ";
            wounds = 2;
        }
        else {
            sevText = "killed in action! ";
            wounds = 3;
            this.gm.sailorsLost++;
        }

        //save for KMDT if killed, reroll to new crew injury
        while (crewInjuryRoll == 2 && severity == 6 && this.gm.halsUndBeinbruch > 0) {
            crewInjuryRoll = d6Rollx2();
            this.gm.halsUndBeinbruch--;
            this.gm.sailorsLost--;
        }

        //assign wounds and finish return text
        switch (crewInjuryRoll) {
            case 2:
                toReturn = "You have been " + sevText;
                this.crew_health["Kommandant"] += wounds;
                if (this.crew_health["Kommandant"] == 3) {
                    //game over
                    let cause = "Kommandant killed " + this.gm.getFullDate();
                    cause += " - KIA by " + attacker;

                    console.log("GAME OVER: " + cause);
                    const goPopup = new GameOverPopup(this.tv, this.gm, this.gm.currentEncounter, cause);
                }
                break;
            case 3:
                toReturn = "The First Officer has been " + sevText;
                person = "Watch Officer 1";
                this.gm.sub.crew_health[person] += wounds;
                break;
            case 4:
            case 11:
                toReturn = "The Engineer has been " + sevText;
                person = "Engineer";
                this.gm.sub.crew_health[person] += wounds;
                break;
            case 5:
                toReturn = "The Doctor has been " + sevText;
                person = "Doctor";
                this.gm.sub.crew_health[person] += wounds;
                break;
            case 6:
            case 7:
            case 8:
            case 9:
                toReturn = "A crew member has been " + sevText;
                var injuryAllocated = false;
                for (var key in this.gm.sub.crew_health) {
                    if (key.includes("Crew")) {
                        //find uninjured crew to allocate first
                        if (this.gm.sub.crew_health[key] == 0) {
                            this.gm.sub.crew_health[key] += wounds;
                            injuryAllocated = true;
                            break;
                        }
                        else {
                            continue;
                        }
                    }
                }

                //if no crew member is uninjured and injury still unallocated, find a LW crew member and make them SW
                if (!injuryAllocated) {
                    for (var key in this.gm.sub.crew_health) {
                        if (key.includes("Crew")) { 
                            //find SW crew first
                            if (this.gm.sub.crew_health[key] == 1) {
                                this.gm.sub.crew_health += wounds;
                                injuryAllocated = true;
                                break;
                            }
                            else {
                                continue;
                            }
                        }
                    }
                }

                //if no crew member is LW and injury still unallocated, find a SW crew member and make them KIA
                if (!injuryAllocated) {
                    for (var key in this.gm.sub.crew_health) {
                        if (key.includes("Crew")) { 
                            //find SW crew first
                            if (this.gm.sub.crew_health[key] == 2) {
                                this.gm.sub.crew_health += wounds;
                                injuryAllocated = true;
                                break;
                            }
                            else {
                                continue;
                            }
                        }
                    }
                }

                if (!injuryAllocated) {
                    console.log("Injury not able to be allocated to crew member.");
                }
                break;
            case 10:
                toReturn = "The Second Officer has been " + sevText;
                person = "Watch Officer 2";
                this.gm.sub.crew_health[person] += wounds;
                break;
            case 12:
                if (this.gm.sub.crew_health["Abwehr Agent"] >= 0) {
                    toReturn = "The Abwehr Agent has been " + sevText;
                    person = "Abwehr Agent";
                    this.gm.sub.crew_health[person] += wounds;
                }
                else {
                    toReturn = "Our crew narrowly avoided injury! ";
                }
                break;
        }
        return toReturn;
    }

    /**
     * Called after an encounter, or between encounters / rounds to attempt to repair all damaged systems
     * Updates all damaged (1) systems to either operable (0) or inoperative (2)
     * @returns string of successful or unsuccessful repair attempts
     */
    repair() {
        this.flooding_Damage = 0;

        var messageToReturn = "";
        var repaired = "";
        var notAbleToRepair = "";
        
        let mods = 0;
        let roll = 0;
        let result = 0;
        if (this.crew_health["Engineer"] >= 2) {
            mods += 1
        }
        else if (this.crew_levels["Engineer"] == 1) {
            mods -= 1
        }

        for (const [key, value] of Object.entries(this.systems)) {
            if (value == 1) {
                roll = d6Roll();
                result = roll + result;
                console.log("Repair roll for " + key + ". Result: " + result);
                switch (key) {
                    case "Electric Engine #1":
                    case "Electric Engine #2":
                    case "Periscope":
                    case "Batteries":
                        if (result <= 4) {
                            this.systems[key] = 0;
                            repaired = repaired + key + ", ";
                        }
                        else {
                            this.systems[key] = 2;
                            notAbleToRepair = notAbleToRepair + key + ", ";
                        }
                        break;
                    case "Hydrophones":
                    case "Dive Planes":
                    case "Flak Gun":
                    case "3.7 Flak":
                    case "Deck Gun":
                    case "Forward Torpedo Doors":
                    case "Aft Torpedo Doors":
                    case "Fuel Tanks":
                    case "Radio":
                        if (result <= 2) {
                            this.systems[key] = 0;
                            repaired = repaired + key + ", ";
                        }
                        else {
                            this.systems[key] = 2;
                            notAbleToRepair = notAbleToRepair + key + ", ";
                        }
                        break;
                    case "Diesel Engine #1":
                    case "Diesel Engine #2":
                        this.systems[key] = 2;
                        notAbleToRepair = notAbleToRepair + key + ", ";
                        continue;
                    default:
                        console.log("Error attempting to repair " + key);
                }
            }
        }

        //Format damage / not damaged strings for one final damage string
        //First if BOTH a repair occurs AND an unable to repair occurs
        if (repaired != "" && notAbleToRepair != "") {
            repaired = repaired.slice(0, -2);
            notAbleToRepair = notAbleToRepair.slice(0, -2);

            messageToReturn = "I have some good news and bad news, Kommandant. <br><br>"
            messageToReturn += "<strong>Repaired:</strong> " + repaired + "<br>";
            messageToReturn += "<strong>Unable To Repair:</strong> " + notAbleToRepair;
        }
        else if (repaired != "") {      //only able to repair (no occurances of not able to repair)
            repaired = repaired.slice(0, -2);

            messageToReturn = "Good news, Kommandant! <br><br>"
            messageToReturn += "<strong>Repaired:</strong> " + repaired;
        }
        else if (notAbleToRepair != "") {      //only failure(s) to repair (no occurances of repairing)
            notAbleToRepair = notAbleToRepair.slice(0, -2);

            messageToReturn = "Bad news, Kommandant! <br><br>"
            messageToReturn += "<strong>Unable To Repair:</strong> " + notAbleToRepair;
        }


        //Check if game over from both diesels being knocked out
        if (this.dieselsInop() == 2){
            if (this.gm.currentBox == this.gm.patrol.getPatrolLength() || this.gm.currentBox == 1){
                //When 1 square from port, scuttling
                //Roll 2d6. 2-10 is successful recovery of crew, new uboat. 11 or 12 crew is lost at sea, game over
                //TODO
                let recoveryRoll = d6Rollx2();
                if (this.getSystemStatus("Radio") == "Inoperative") {
                    recoveryRoll += 4;
                }
                if (recoveryRoll <= 10) {
                    //Crew recovered. New uboat
                    this.gm.recovery();
                }
                else {
                    let cause = "Crew lost at sea " + this.gm.getFullDate();
                    cause += " - Forced to scuttle after damage to both diesel engines by the " + this.gm.currentEncounter.shipList[0].getClassAndName();
                    console.log("GAME OVER: " + cause);
                    const goPopup = new GameOverPopup(this.tv, this.gm, this.gm.currentEncounter, cause);
                }
            }
            else {
                //TODO need to change scene to empty sea and force uboat to surface
                this.tv.uboat.surface();
                let cause = "Scuttled " + this.gm.getFullDate();
                cause += " - Forced to scuttle after damage to both diesel engines by the " + this.gm.currentEncounter.shipList[0].getClassAndName();
                console.log("GAME OVER: " + cause);
                const goPopup = new GameOverPopup(this.tv, this.gm, this.gm.currentEncounter, cause);
            }
        }

        //If not already aborting patrol and fuel tanks damaged or 1 diesel inop
        if (!this.gm.abortingPatrol && (this.dieselsInop() == 1 || this.getSystemStatus("Fuel Tanks") == "Inoperative")) {
            this.gm.abortPatrol();
        }
        return messageToReturn;
    }

    /**
     * When doctor is SW or KIA, need to check every patrol box to see if SW crew members die
     * @returns string of any crew members that may have changed to KIA, if applicable
     */
    checkVitals() {
        var messageToReturn = "";
        
        let roll = 0;

        for (const [key, value] of Object.entries(this.crew_health)) {
            if (value == 2) {
                roll = d6Roll();
                if (roll >= 4) {
                    messageToReturn += key + " has passed away due to his injuries. "
                    this.crew_health[key] = 3;
                    this.gm.sailorsLost++;
                }
            }
        }

        return messageToReturn;
    }
}