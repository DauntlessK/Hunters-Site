class Uboat{
    constructor(type){
        this.subClass = type;
        //this.patrol = null;

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
                break;
            case "VIIB":
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
                break;
        }

        this.g7a = 0;
        this.g7e = 0;

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
    }

    getType(){
        return this.subClass;
    }
}