class StatusPopup{
    constructor(tv, gm) {
        this.tv = tv;
        this.gm = gm;

        this.gameWasAlreadyPaused = false; //used to remember if the game was already in a paused state
        if (this.tv.isUnpaused == false) {
            this.gameWasAlreadyPaused = true;
        }
        this.tv.setStatusMode(true);
        this.tv.pauseGame(true);

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");
        this.element.classList.add("StatusMessage");
       
        // if patrolling, show current patrol header and summary. Otherwise,
        // show a "default" header
        if (this.gm.patrolling) {
            this.patrolSummaryHeader = this.gm.logBook[this.gm.patrolNum].getPatrolHeader();
            this.patrolSummary = this.gm.logBook[this.gm.patrolNum].getPatrolSummary();            
        }
        else {
            this.patrolSummaryHeader = this.gm.getFullUboatID() + " - " + this.gm.getLRankAndName() + "<br>";
            this.patrolSummaryHeader += this.gm.getFullDate() + ", in port";
            this.patrolSummary = "<p>Reported to boat for immediate departure.</p>" 
        }

        //create correct popup based on message
        this.statusWindow();
        this.container.appendChild(this.element);
        this.updateSystems();
    }

    statusWindow() {
        //Message to announce starting rank, sub, date, etc

        const healthShort = ["OK", "LW", "SW", "KIA"];
        const crewlevelShort = ["GRN", "TRN", "VET", "ELT"];
        const officerlevelShort = ["TRN", "EXP"];
        var reload = "Reload";
        if (this.tv.isInEncounter) {
            reload = "";
        }

        //Image path creations
        let rankImagePath = "images/ui/ranks/Rank" + this.gm.sub.crew_levels["Kommandant"].toString() + ".png";
        let upgradeTokenNum = 0;
        if (this.gm.uboatUpgrade) {
            upgradeTokenNum = 1;
        }
        let uboatUpgradeImagePath = "images/ui/decorations/UpgradeToken" + upgradeTokenNum +".png";
        let knightsCrossImagePath = "images/ui/decorations/KnightsCross" + (this.gm.sub.knightsCross) +".png";
        let warBadgeImagePath = "images/ui/decorations/UboatWarBadge" + (this.gm.uboatWarBadgeLevel) +".png";
        let frontClaspImagePath = "images/ui/decorations/UboatFrontClasp" + (this.gm.uboatFrontClaspLevel) +".png";
        let germanCrossImagePath = "images/ui/decorations/GermanCross" + (this.gm.germanCrossLevel) +".png";
        let woundBadgeImagePath = "images/ui/decorations/WoundBadge" + (this.gm.woundBadgeLevel) +".png";

        //Make string for pervious commands

        let previousCommands = "Prev. boats: "
        for (let i = 0; i < this.gm.pastSubs.length; i++) {
            if (i > 0) {
                previousCommands += ", ";
            }
            previousCommands += this.gm.pastSubs[i];
        }

        //Add s to patrols for career stats if not 1 patrol
        let pluralPatrols = "";
        if (this.gm.patrolNum != 1) {
            pluralPatrols = "s";
        }

        //Show best patrol GRT, or use this current one if greater
        let bestPatrol = 0;
        let currentPatrolGRT = this.gm.getPatrolTotalGRT("Int");
        if (currentPatrolGRT > this.gm.bestPatrolGRT) {
            bestPatrol = currentPatrolGRT;
        }
        else {
            bestPatrol = this.gm.bestPatrolGRT;
        }
        bestPatrol = bestPatrol.toLocaleString();

        //Get count of capital ships sunk
        let capShipsSunk = 0;
        for (let i = 0; i < this.gm.shipsSunk.length; i++) {
            if (this.gm.shipsSunk[i].getType() == "Capital Ship") {
                capShipsSunk++;
            }
        }

        //new div to add
        this.element.innerHTML = (`
            <img src = "images/ui/Status.png">
            <p class="Type">Type: ${this.gm.sub.getType()}</p>
            <p class="Patrol">Patrol # ${this.gm.patrolNum}</p>

            <p id="ElectricEngine1" class = "tooltip-wrap">Electric Engine #1
                <span class="tooltip-text">Aircraft & Escort damage is more devestating with 1 electric<br>
                engine out. If both are out, damage done is even worse.</span></p>

            <p id="ElectricEngine2" class = "tooltip-wrap">Electric Engine #2
                <span class="tooltip-text">Aircraft & Escort damage is more devestating with 1 electric<br>
                engine out. If both are out, damage done is even worse.</span></p>

            <p id="DieselEngine1" class = "tooltip-wrap">Diesel Engine #1
                <span class="tooltip-text">If 1 diesel is out and cannot be repaired, the U-Boat<br>
                is forced to return to port. If both cannot be repaired,<br>
                you are forced to scuttle the boat.</span></p>

            <p id="DieselEngine2" class = "tooltip-wrap">Diesel Engine #2
                <span class="tooltip-text">If 1 diesel is out and cannot be repaired, the U-Boat<br>
                is forced to return to port. If both cannot be repaired,<br>
                you are forced to scuttle the boat.</span></p>

            <p id="Periscope" class = "tooltip-wrap">Periscope
            <span class="tooltip-text">If disabled, U-Boat cannot make submerged attacks.</span></p>

            <p id="Radio" class = "tooltip-wrap">Radio
            <span class="tooltip-text">If inoperable, crew rescue when needed is much more difficult.</span></p>

            <p id="Hydrophones" class = "tooltip-wrap">Hydrophones
            <span class="tooltip-text">When disabled, U-Boat cannot properly evade attacks and<br>
            takes more damage as a result.</span></p>

            <p id="Batteries" class = "tooltip-wrap">Batteries
            <span class="tooltip-text">When disabled, U-Boat cannot properly evade attacks and<br>
            takes more damage as a result.</span></p>

            <p id="ForwardTorpedoDoors" class = "tooltip-wrap">Forward Torpedo Doors
            <span class="tooltip-text">When disabled, U-Boat cannot fire forward<br>
            torpedoes or release mines.</span></p>

            <p id="AftTorpedoDoors" class = "tooltip-wrap">Aft Torpedo Doors
            <span class="tooltip-text">When disabled, U-Boat cannot fire aft<br>
            torpedoes or release mines.</span></p>

            <p id="DivePlanes" class = "tooltip-wrap">Dive Planes
            <span class="tooltip-text">Danger when disabled: U-Boat takes more damage and<br>
            is easier to detect, being unable to properly maneuver.</span></p>

            <p id="FuelTanks" class = "tooltip-wrap">Fuel Tanks
            <span class="tooltip-text">Danger when disabled: U-Boat takes more damage and<br>
                                        is easier to detect, being unable to properly maneuver.<br>
                                        If not repaired, U-Boat is foreced to return to port.</span></p>

            <p id="DeckGun" class = "tooltip-wrap">Deck Gun
                <span class="tooltip-text">Unable to fire the deck gun when disabled.</span></p>

            <p id="FlakGun" class = "tooltip-wrap">Flak Gun</p>
                <span class="tooltip-text">Unable to fire the flak gun when disabled.</span></p>

            <p id="Flak37" class = "tooltip-wrap">3.7 Flak</p>
                <span class="tooltip-text">Unable to fire the 3.7 flak gun when disabled.</span></p>

            <table class = "UboatCrew">
            <tr>
                <th>Crew</th>
                <th>Level</th>
                <th>Status</th>
            </tr>
            <tr id="Kommandant">
                <td>KMDT</td>
                <td>-</td>
                <td>${healthShort[this.gm.sub.crew_health["Kommandant"]]}</td>
            </tr>
            <tr id="WatchOfficer1">
                <td>WO1</td>
                <td>${officerlevelShort[this.gm.sub.crew_levels["Watch Officer 1"]]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Watch Officer 1"]]}</td>
            </tr>
            <tr id="WatchOfficer2">
                <td>WO2</td>
                <td>${officerlevelShort[this.gm.sub.crew_levels["Watch Officer 2"]]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Watch Officer 2"]]}</td>
            </tr>
            <tr id="Engineer">
                <td>ENG</td>
                <td>${officerlevelShort[this.gm.sub.crew_levels["Engineer"]]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Engineer"]]}</td>
            </tr>
            <tr id="Doctor">
                <td>DOC</td>
                <td>${officerlevelShort[this.gm.sub.crew_levels["Doctor"]]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Doctor"]]}</td>
            </tr>
            <tr id="Crew1">
                <td>CREW 1</td>
                <td>${crewlevelShort[this.gm.sub.crew_levels["Crew"]]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Crew 1"]]}</td>
            </tr>
            <tr id="Crew2">
                <td>CREW 2</td>
                <td>${crewlevelShort[this.gm.sub.crew_levels["Crew"]]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Crew 2"]]}</td>
            </tr>
            <tr id="Crew3">
                <td>CREW 3</td>
                <td>${crewlevelShort[this.gm.sub.crew_levels["Crew"]]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Crew 3"]]}</td>
            </tr>
            <tr id="Crew4">
                <td>CREW 4</td>
                <td>${crewlevelShort[this.gm.sub.crew_levels["Crew"]]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Crew 4"]]}</td>
            </tr>

            <div class="Patrol_Log">
                ${this.patrolSummaryHeader}<br>
                ${this.patrolSummary}
            </div>

            <div class="Career">
                <div class="Commander_Image">
                    <img src = "images/ui/ranks/CommanderPortrait.png" style="max-height: 140px;">
                </div>
                <div class="Career_Head">
                    <span class="Bold">${this.gm.getRankAndName()}</span><br>
                    ${this.gm.getFullUboatID()}<br>
                    ${previousCommands}<br>
                    ${this.gm.patrolNum} Patrol${pluralPatrols}<br>
                    ${this.gm.getTotalGRT("String")} GRT Sunk
                </div>
                <div class="Commander_Rank">
                    <img src = ${rankImagePath}>
                </div>                
                <div class="Career_Decorations">
                    <div class="knights_cross">
                        <img src=${knightsCrossImagePath}>
                    </div>
                    <div class="uboat_front_clasp">
                        <img src=${frontClaspImagePath}>
                    </div>
                    <div class="uboat_war_badge">
                        <img src=${warBadgeImagePath}>
                    </div>
                    <div class="wound_badge">
                        <img src=${woundBadgeImagePath}>
                    </div>
                    <div class="german_cross">
                        <img src=${germanCrossImagePath}>
                    </div>
                    <div class="upgrade_badge">
                        <img src=${uboatUpgradeImagePath}>
                    </div>
                </div>
                <div class="Career_Stats">
                    Ships sunk: ${this.gm.shipsSunk.length} <br>
                    Capital ships sunk: ${capShipsSunk} <br>
                    Planes shot down: ${this.gm.planesShotDown} <br> 
                    ---- <br>
                    Best patrol: ${bestPatrol} GRT Sunk<br>
                    Successful patrols: ${this.gm.successfulPatrols} <br>
                    Unsuccessful patrols: ${this.gm.unsuccessfulPatrols} <br> 
                    Months at sea: ${this.gm.monthsAtSea} <br>
                    Months in port: ${this.gm.monthsInPort} <br>
                    Random events: ${this.gm.randomEvents} <br>
                    ---- <br>
                    Times found by planes: ${this.gm.numPlaneEncounters} <br>
                    Times attacked by planes: ${this.gm.numPlaneAttacks} <br>
                    Times detected: ${this.gm.numTimesDetected} <br>
                    Damage done: ${this.gm.damageDone} <br>
                    Damage taken: ${this.gm.hitsTaken} <br>
                    Sailors lost: ${this.gm.sailorsLost} <br>
                </div>
            </div>

            <button class="CloseStatus_button" id="close">Close</button>
            <button class="ReloadStatus_button" id="reload">${reload}</button>
        `)

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "close"){
                //close popup
                this.done();
            }
            else if (event.target.id == "reload" && ! this.tv.isInEncounter) {
                this.tv.enterReloadMode();
                this.done();
            }
        })
    }

    //Update all systems classes with text indicating they are broken if so, update health with color if wounded
    updateSystems() {
        //Remove 3.7 Flak if Type VII
        if (this.gm.sub.getType().includes("VII")) {
            var elementSys = document.getElementById("Flak37");
            elementSys.style.visibility = "hidden";
        }

        //change text for systems
        for (var key in this.gm.sub.systems) {
            //If system is damaged
            if (this.gm.sub.systems[key] == 1) {
                var system = key;
                //remove spaces and '#' and '.'
                system = system.replace(/\s/g, "");
                system = system.replace("#", "");
                system = system.replace(".", "");
                if (system == "37Flak") {
                    system = "Flak37";
                }

                var elementSys = document.getElementById(system);
                elementSys.style.backgroundColor="orange";
            }
            //If system is inoperable
            else if (this.gm.sub.systems[key] == 2) {
                var system = key;
                //remove spaces and '#'
                system = system.replace(/\s/g, "");
                system = system.replace("#", "");
                system = system.replace(".", "");

                if (system == "37Flak") {
                    system = "Flak37";
                }

                var elementSys = document.getElementById(system);
                elementSys.style.backgroundColor="red";
                elementSys.style.color="white";
            }
        }

        //Change text for crew
        for (var key in this.gm.sub.crew_health) {
            //If member is LW
            if (this.gm.sub.crew_health[key] == 1) {
                var member = key;
                //remove spaces
                member = member.replace(/\s/g, "");

                var elementSys = document.getElementById(member);
                elementSys.style.backgroundColor="yellow";
            }
            else if (this.gm.sub.crew_health[key] == 2) {
                var member = key;
                //remove spaces
                member = member.replace(/\s/g, "");

                var elementSys = document.getElementById(member);
                elementSys.style.backgroundColor="orange";
            }
            else if (this.gm.sub.crew_health[key] == 3) {
                var member = key;
                //remove spaces
                member = member.replace(/\s/g, "");
                console.log(member);

                var elementSys = document.getElementById(member);
                elementSys.style.backgroundColor="red";
                elementSys.style.color="white";
            }

        }
    }


    done(){
        this.element.remove();
        this.tv.setStatusMode(false);
        if (!this.gameWasAlreadyPaused) {
            this.tv.pauseGame(false);
        }
        this.gm.statusResolved = true;
    }
}