class StatusPopup{
    constructor(tv, gm) {
        this.tv = tv;
        this.gm = gm;

        this.tv.pauseGame();

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

        //new div to add
        this.element.innerHTML = (`
            <img src = "images/ui/Status.png">
            <p class="EEngine1">Electric Engine #1</p>
            <p class="EEngine2">Electric Engine #2</p>
            <p class="DEngine1">Diesel Engine #1</p>
            <p class="DEngine2">Diesel Engine #2</p>
            <p class="Periscope">Periscope</p>
            <p class="Radio">Radio</p>
            <p class="Hydrophones">Hydrophones</p>
            <p class="Batteries">Batteries</p>
            <p class="FTDoors">Forward Torpedo Doors</p>
            <p class="ATDoors">Aft Torpedo Doors</p>
            <p class="DivePlanes">Dive Planes</p>
            <p class="FuelTanks">Fuel Tanks</p>
            <p class="DeckGun">Deck Gun</p>
            <p class="FlakGun">Flak Gun</p>
            <table class = "UboatCrew">
            <tr>
                <th>Crew</th>
                <th>Level</th>
                <th>Status</th>
            </tr>
            <tr>
                <td>KMDT</td>
                <td>${this.gm.sub.crew_levels["Kommandant"]}</td>
                <td>${this.gm.sub.crew_health["Kommandant"]}</td>
            </tr>
            <tr>
                <td>WO1</td>
                <td>${this.gm.sub.crew_levels["Watch Officer 1"]}</td>
                <td>${this.gm.sub.crew_health["Watch Officer 1"]}</td>
            </tr>
            <tr>
                <td>WO2</td>
                <td>${this.gm.sub.crew_levels["Watch Officer 2"]}</td>
                <td>${this.gm.sub.crew_health["Watch Officer 2"]}</td>
            </tr>
            <tr>
                <td>ENG</td>
                <td>${this.gm.sub.crew_levels["Engineer"]}</td>
                <td>${this.gm.sub.crew_health["Engineer"]}</td>
            </tr>
            <tr>
                <td>DOC</td>
                <td>${this.gm.sub.crew_levels["Doctor"]}</td>
                <td>${this.gm.sub.crew_health["Doctor"]}</td>
            </tr>
            <tr>
                <td>CREW 1</td>
                <td>${this.gm.sub.crew_levels["Crew"]}</td>
                <td>${this.gm.sub.crew_health["Crew 1"]}</td>
            </tr>
             <tr>
                <td>CREW 2</td>
                <td>${this.gm.sub.crew_levels["Crew"]}</td>
                <td>${this.gm.sub.crew_health["Crew 2"]}</td>
            </tr>
            <tr>
                <td>CREW 3</td>
                <td>${this.gm.sub.crew_levels["Crew"]}</td>
                <td>${this.gm.sub.crew_health["Crew 3"]}</td>
            </tr>
            <tr>
                <td>CREW 4</td>
                <td>${this.gm.sub.crew_levels["Crew"]}</td>
                <td>${this.gm.sub.crew_health["Crew 4"]}</td>
            </tr>
            <button class="CloseStatus_button">Close</button>
            <button class="ReloadStatus_button">Reload</button>
        `)

        this.element.querySelector("button").addEventListener("click", ()=> {
            //close popup
            this.done();
            this.gm.eventResolved = true;
        })
    }


    done(){
        this.element.remove();
        this.tv.unpauseGame();
    }
}