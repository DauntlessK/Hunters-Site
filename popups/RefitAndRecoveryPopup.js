class RefitAndRecovery{
    constructor(tv, gm, totalTime, refitResults, recoveryResults) {
        this.tv = tv;
        this.gm = gm;
        this.totalTime = totalTime;
        this.refitResults = refitResults;
        this.recoveryResults = recoveryResults;

        this.tv.pauseGame(true);

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");
        this.element.classList.add("TextMessage");

        refitAndRecovery()

    }

    refitAndRecovery() {
        //new div to add

        if (totalTime == 1) {
            totalTime = "1 month ";
        }
        else {
            totalTime = String(totalTime) + " months ";
        }

        this.element.innerHTML = (`
            <div class = "Refit">
            <h3 class="HeaderMessage_h3">Repair & Refit<br>
            </h3>
            <p class ="PatrolMessage_p">${refitResults}
            </p>
            </div>


            <div class = "Recovery">
                <h3 class="HeaderMessage_h3">Crew Recovery<br>
                </h3>
                <p class ="PatrolMessage_p">${recoveryResults}
            </div>

            <div class = "Port_Summary">
                <p class ="PatrolMessage_p">${totalTime} spent in port.</p>
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