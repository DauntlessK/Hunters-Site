class AwardsPopup{
    constructor(tv, gm) {
        this.tv = tv;
        this.gm = gm;

        this.tv.pauseGame(true);

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");
        this.element.classList.add("TextMessage");

        this.awardsAndPromotionRunDown()
    }

    //Systematically go through each possible award, promotion and possible level upgrade
    awardsAndPromotionRunDown() {

        //Check for possible increase to crew skill - done every 3 successful patrols
        if (this.gm.successfulPatrols % 3 == 0 && this.gm.checkedForCrewLevelUp) {
            let crewLevelUpgradeRoll = d6Roll();
            let crewMan = "";

            switch (crewLevelUpgradeRoll) {
                case 1:
                    crewMan = "Engineer";
                    break;
                case 2:
                    crewMan = "Doctor";
                    break;
                case 3:
                    crewMan = "Watch Officer 1";
                    break;
                case 4:
                    crewMan = "Watch Officer 2";
                    break;
                case 5:
                case 6:
                    crewMan = "Crew";
                    break;
            }

            if (crewMan != "Crew") {
                this.gm.sub.crew_levels[crewMan] += 1;
            }
            
        }

        //Knight's Cross Check
        
        //LAST check for promotion possibility- every 12 months minimum
        if ((this.gm.monthsAtSea + this.gm.monthsInPort) / 12 >= this.gm.numPromotionChecks + 1) {
            this.gm.numPromotionChecks++;
        }

    }

    refitAndRecovery() {
        //new div to add

        if (this.totalTime == 1) {
            this.totalTime = "1 month ";
        }
        else {
            this.totalTime = String(this.totalTime) + " months ";
        }

        this.element.innerHTML = (`
            <div class = "Refit">
            <h3 class="HeaderMessage_h3">Repair & Refit<br>
            </h3>
            <p class ="PatrolMessage_p">${this.refitResults}
            </p>
            </div>


            <div class = "Recovery">
                <h3 class="HeaderMessage_h3">Crew Recovery<br>
                </h3>
                <p class ="PatrolMessage_p">${this.recoveryResults}
            </div>

            <div class = "Port_Summary">
                <p class ="PatrolMessage_p">${this.totalTime} spent in port.</p>
            </div>

            <button class="AttackPopup_button" id="continue">Continue</button>
            
        `)

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "continue"){
                //close popup
                this.done();
            }
        })

        this.container.appendChild(this.element);
    }

    done(){
        this.element.remove();
        this.tv.pauseGame(false);
        this.gm.eventResolved = true;

        this.gm.sub.torpedoResupply();
        //force update of torpedo buttons
        for (let i = 1; i < 7; i++) {
            this.tv.mainUI.tubeButtonArray[i].getLatestState();
        }
    }

}