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

        //create correct popup based on message
        this.startGameTextElement();
        this.container.appendChild(this.element);
    }

    startGameTextElement() {
        //Message to announce starting rank, sub, date, etc

        const healthShort = ["OK", "LW", "SW", "KIA"];
        var reload = "Reload";
        if (this.tv.isInEncounter) {
            reload = "";
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
            <table class = "UboatCrew">
            <tr>
                <th>Crew</th>
                <th>Level</th>
                <th>Status</th>
            </tr>
            <tr>
                <td>KMDT</td>
                <td>${this.gm.sub.crew_levels["Kommandant"]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Kommandant"]]}</td>
            </tr>
            <tr>
                <td>WO1</td>
                <td>${this.gm.sub.crew_levels["Watch Officer 1"]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Watch Officer 1"]]}</td>
            </tr>
            <tr>
                <td>WO2</td>
                <td>${this.gm.sub.crew_levels["Watch Officer 2"]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Watch Officer 2"]]}</td>
            </tr>
            <tr>
                <td>ENG</td>
                <td>${this.gm.sub.crew_levels["Engineer"]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Engineer"]]}</td>
            </tr>
            <tr>
                <td>DOC</td>
                <td>${this.gm.sub.crew_levels["Doctor"]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Doctor"]]}</td>
            </tr>
            <tr>
                <td>CREW 1</td>
                <td>${this.gm.sub.crew_levels["Crew"]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Crew 1"]]}</td>
            </tr>
             <tr>
                <td>CREW 2</td>
                <td>${this.gm.sub.crew_levels["Crew"]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Crew 2"]]}</td>
            </tr>
            <tr>
                <td>CREW 3</td>
                <td>${this.gm.sub.crew_levels["Crew"]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Crew 3"]]}</td>
            </tr>
            <tr>
                <td>CREW 4</td>
                <td>${this.gm.sub.crew_levels["Crew"]}</td>
                <td>${healthShort[this.gm.sub.crew_health["Crew 4"]]}</td>
            </tr>
            <button class="CloseStatus_button" id="close">Close</button>
            <button class="ReloadStatus_button" id="reload">${reload}</button>
        `)

        //Update all systems classes with text indicating they are broken if so
        for (var key in this.gm.sub.systems) {
            if (this.gm.sub.systems[key] == 1) {
                var system = key;
                system = system.replace(/\s/g, "");
                system = system.replace("#", "");
                console.log(system);

                var elementSys = document.getElementById(system);
                console.log(elementSys);
                elementSys.style.backgroundColor="orange";
            }
            else if (this.gm.sub.systems[key] == 2) {
                var system = key;
                system = system.replace(/\s/g, "");
                system = system.replace("#", "");
                console.log(system);

                var elementSys = document.getElementById(system);
                console.log(elementSys);
                elementSys.style.backgroundColor="red";
                elementSys.style.color="white";
            }
        }

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "close"){
                //close popup
                this.done();
                this.gm.eventResolved = true;
            }
            else if (event.target.id == "reload" && ! this.tv.isInEncounter) {
                this.tv.enterReloadMode();
                this.done();
                this.gm.eventResolved = true;
            }
        })
    }


    done(){
        this.element.remove();
        this.tv.setStatusMode(false);
        if (!this.gameWasAlreadyPaused) {
            this.tv.pauseGame(false);
        }
    }
}