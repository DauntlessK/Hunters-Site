class GMPopup{
    constructor(tv, gm) {
        this.tv = tv;
        this.gm = gm;

        this.tv.pauseGame(true);

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");
        this.element.classList.add("TextMessage");

    }

    startGameText(month, year) {
        //Message to announce starting rank, sub, date, etc
        var storyIntroText = "";
        if (year == 1939){
            storyIntroText = "The invasion of Poland has begun... Hostilities with England effective immediately. It is time to prove your mettle and help the war effort in disrupting shipping to the allies."
        }
        else if (year == 1940 && month < 6){
            storyIntroText = "With Poland defeated, Germany looks to tighten its control of the Atlantic. We must continue to strangle the Allies' supply lines."
        }
        else if (year == 1940){
            storyIntroText = "With France defeated, Germany's U-Boats have mostly relocated to French ports. Help tip the Battle of the Atlantic, now in full swing, in favor of Germany."
        }
        else {
            storyIntroText = "The Battle for the Atlantic has swung against Germany, as hundreds of U-Boats have been lost. Exercise caution as the allies have learned to hunt U-Boats."
        }

        //new div to add
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">The Hunters: German U-Boats at War
            <p class="TextMessage_p">${this.gm.getFullDate()}<br>
            ${this.gm.getLRankAndName()}, please report to ${this.gm.getFullUboatID()} immediately.<br><br>
            ${storyIntroText}<br><br>Formal orders to follow shortly.</p>
            <button class="TextMessage_button" id="continue">Next</button>
        `)

        this.element.querySelector("button").addEventListener("click", ()=> {
            //close popup
            if (event.target.id == "continue") {
                this.done();
            }
        })

        this.container.appendChild(this.element);
    }

    arcticAssignmentPopup() {
        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">${this.gm.getFullUboatID} has been permanently assigned to the arctic.<br>
            </p>
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

    abortPatrolPopup() {

    }

    
    abortTowedBackPopup() {
        //new div to add
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Towed Back To Port!<br>
            </h3>
            <p class="PatrolMessage_p">${this.gm.getFullUboatID} has been towed back to port. Thankfully we were close to home
            or scuttling would have been our only option.<br>
            </p>
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

    deathKIAPopup(message) {
        //new div to add
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Sad news, Herr Kaleun.<br>
            </h3>
            <p class="PatrolMessage_p">${message}</p>
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

    abortTowedBackPopup() {
        //new div to add
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Welcome Back!<br>
            </h3>
            <p class="PatrolMessage_p">${this.gm.getFullUboatID} has arrived back at port.<br>
            </p>
            
        `)
            //<button class="AttackPopup_button" id="continue">Continue</button>
        this.element.addEventListener("click", ()=> {
            if (event.target.id == "continue"){
                //close popup
                this.done();
            }
        })

        this.container.appendChild(this.element);
    }

    endPatrol() {
        //new div to add
        let patrolResult = "";
        if (this.gm.missionComplete) {
            patrolResult = "Success"
        }
        else {
            patrolResult = "Failure"
        }

        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Welcome Back!<br>
            </h3>
            <p class="PatrolMessage_p">${this.gm.getFullUboatID} has arrived back at port.<br>
            Orders: ${this.gm.currentOrdersLong} <br>
            Mission Result: ${patrolResult}
            </p>
            
        `)
            //<button class="AttackPopup_button" id="continue">Continue</button>
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
    }
}