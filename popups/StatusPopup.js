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

        /**if (this.gm.patrolling) {
            this.patrolSummary = this.gm.logBook[this.gm.patrolNum].getPatrolSummary();
        }
        else {
            //Header only with departure entry
            this.patrolSummary = this.gm.getFullUboatID() + " - " + this.gm.getLRankAndName() + "<br>";
            this.patrolSummary = this.patrolSummary + this.gm.getFullDate() + ", in port";
            this.patrolSummary = this.patrolSummary + "<p>Reported to boat for immediate departure.</p>" 
        }*/
       
        this.patrolSummaryHeader = this.gm.logBook[this.gm.patrolNum].getPatrolHeader();
        this.patrolSummary = this.gm.logBook[this.gm.patrolNum].getPatrolSummary();

        //create correct popup based on message
        this.statusWindow();
        this.container.appendChild(this.element);
        this.updateSystems();
    }

    statusWindow() {
        //Message to announce starting rank, sub, date, etc

        const healthShort = ["OK", "LW", "SW", "KIA"];
        var reload = "Reload";
        if (this.tv.isInEncounter) {
            reload = "";
        }

        let rankNum = this.gm.sub.crew_levels["Kommandant"] + 1;
        let rankImagePath = "images/ui/ranks/Rank" + rankNum.toString() + ".png";

        //Make string for pervious commands
        let previousCommands = ""
        if (this.gm.pastSubs.length > 0) {
            previousCommands = "Previous Commands: " + "XYZ";
        }

        //Add s to patrols for career stats if not 1 patrol
        let pluralPatrols = "";
        if (this.gm.patrolNum != 1) {
            pluralPatrols = "s";
        }

        //Figure out best patrol GRT, or use this current one if 0
        let bestPatrol = this.gm.bestPatrolGRT;
        let currentPatrolGRT = 0;
        for (let i = 0; i < this.gm.shipsSunkOnCurrentPatrol.length; i++) {
            currentPatrolGRT += this.gm.shipsSunkOnCurrentPatrol[i].getGRTInt();
        }
        if (currentPatrolGRT > bestPatrol) {
            bestPatrol = currentPatrolGRT;
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
            <p id="ElectricEngine1">Electric Engine #1</p>
            <p id="ElectricEngine2">Electric Engine #2</p>
            <p id="DieselEngine1">Diesel Engine #1</p>
            <p id="DieselEngine2">Diesel Engine #2</p>
            <p id="Periscope">Periscope</p>
            <p id="Radio">Radio</p>
            <p id="Hydrophones">Hydrophones</p>
            <p id="Batteries">Batteries</p>
            <p id="ForwardTorpedoDoors">Forward Torpedo Doors</p>
            <p id="AftTorpedoDoors">Aft Torpedo Doors</p>
            <p id="DivePlanes">Dive Planes</p>
            <p id="FuelTanks">Fuel Tanks</p>
            <p id="DeckGun">Deck Gun</p>
            <p id="FlakGun">Flak Gun</p>
            <p id="Flak37">3.7 Flak</p>
            <table class = "UboatCrew">
            <tr>
                <th>Crew</th>
                <th>Level</th>
                <th>Status</th>
            </tr>
            <tr id="Kommandant">
                <td>KMDT</td>
                <td>${this.gm.sub.crew_levels["Kommandant"]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Kommandant"]]}</td>
            </tr>
            <tr id="WatchOfficer1">
                <td>WO1</td>
                <td>${this.gm.sub.crew_levels["Watch Officer 1"]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Watch Officer 1"]]}</td>
            </tr>
            <tr id="WatchOfficer2">
                <td>WO2</td>
                <td>${this.gm.sub.crew_levels["Watch Officer 2"]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Watch Officer 2"]]}</td>
            </tr>
            <tr id="Engineer">
                <td>ENG</td>
                <td>${this.gm.sub.crew_levels["Engineer"]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Engineer"]]}</td>
            </tr>
            <tr id="Doctor">
                <td>DOC</td>
                <td>${this.gm.sub.crew_levels["Doctor"]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Doctor"]]}</td>
            </tr>
            <tr id="Crew1">
                <td>CREW 1</td>
                <td>${this.gm.sub.crew_levels["Crew"]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Crew 1"]]}</td>
            </tr>
            <tr id="Crew2">
                <td>CREW 2</td>
                <td>${this.gm.sub.crew_levels["Crew"]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Crew 2"]]}</td>
            </tr>
            <tr id="Crew3">
                <td>CREW 3</td>
                <td>${this.gm.sub.crew_levels["Crew"]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Crew 3"]]}</td>
            </tr>
            <tr id="Crew4">
                <td>CREW 4</td>
                <td>${this.gm.sub.crew_levels["Crew"]}</td>
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
                    ${previousCommands}
                    ${this.gm.patrolNum} Patrol${pluralPatrols}<br>
                    ${this.gm.getTotalGRT()} GRT Sunk
                </div>
                <div class="Commander_Rank">
                    <img src = ${rankImagePath}>
                </div>                
                <div class="Career_Decorations">
                    <div class="knights_cross">
                        <img src="images/ui/decorations/deco1.png">
                    </div>
                    <div class="uboat_front_clasp">
                        <img src="images/ui/decorations/deco1.png">
                    </div>
                    <div class="uboat_war_badge">
                        <img src="images/ui/decorations/deco1.png">
                    </div>
                    <div class="wound_badge">
                        <img src="images/ui/decorations/deco1.png">
                    </div>
                    <div class="german_cross">
                        <img src="images/ui/decorations/deco1.png">
                    </div>
                    <div class="upgrade_badge">
                        <img src="images/ui/decorations/deco1.png">
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