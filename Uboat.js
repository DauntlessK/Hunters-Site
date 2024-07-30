class Uboat{
    constructor(type, tv, gm){
        this.subClass = type;
        this.tv = tv;
        this.gm = gm;

        //-----SUBSYSTEM STATES
        // states are: 0=operational, 1=damaged, 2=inoperational
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
            "Flak Gun": 0
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
        //states are 0 = fine, 1 = LW, 2 = SW, 3 = KIA • -1 indicates not present
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

    getType(){
        return this.subClass;
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

        const subResupply = new ResupplyPopup(this.tv, this.gm, this.G7aStarting, this.G7eStarting, this.reserves_aft + this.aft_tubes, 0);

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
                console.log("No Torpedoes available of that type to load forward.")
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
                console.log("No Torpedoes available of that type to load aft.")
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

    //changes all current tubes to mines
    loadMines(){
        for (let i = 1; i < 5 + this.aft_tubes; i++){
            this.tube[i] = 3;
        }
        if (this.getType() == "IXA" || this.getType() == "IXB"){
            this.tube[6] = 3;
        }
        //unsure if forward and aft type counts are needed anymore
        this.forward_G7a = 0;
        this.forward_G7e = 0;
        this.aft_G7a = 0;
        this.aft_G7e = 0;
        
        this.gm.sub.minesLoadedForward = true;
        this.gm.sub.minesLoadedAft = true;
    }

    //Returns int of how many inoperative diesel engines U-boat has
    dieselsInop(){
        var numInOp = 0;
        if (this.systems["Diesel Engine #1"] == 2) {numInOp ++;} 
        if (this.systems["Diesel Engine #2"] == 2) {numInOp ++;}
        return numInOp
    }

    //Returns true if the given weapon has ammo
    canFire(location) {
        if (location == "Fore") {
            for (let i = 1; i < 5; i++) {
                if (this.tube[i] > 0) {
                    return true;
                }
            }
        }
        else if (location == "Aft") {
            for (let i = 5; i < 7; i++) {
                if (this.tube[i] > 0) {
                    return true;
                }
            }
        }
        else {
            if (this.deck_gun_ammo > 0) {
                return true;
            }
        }
        return false;
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
                this.tubeFiring[i] == false;
            }
        }
        this.isFiringFore = false;
        this.isFiringAft = false;
        this.isFiringForeAndAft = false;
    }

    isCrewKnockedOut() {
        var numOfKO = 0;
        for (let i = 0; i < 4; i++) {
            if (this.crew_health[i] > 0) {
                numOfKO++;
            }
        }
        if (numOfKO == 4) {
            return true;
        }
        return false;
    }
}