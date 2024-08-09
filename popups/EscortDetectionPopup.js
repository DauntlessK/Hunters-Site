class EscortDetectionPopup{
    constructor(tv, gm, enc, closeRangeCheck) {
        this.tv = tv;
        this.gm = gm;
        this.enc = enc
        this.closeRangeCheck = closeRangeCheck;

        this.depth = null;
        this.range = null;

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");

        this.element.classList.add("PatrolMessage");

        this.escortWarning();
    }
    
    //Popup when checking to see if boat is detected
    escortWarning(){
        var message = "";

        if (this.closeRangeCheck) {
            message = "Approaching ships - attempting to remain undetected.";
            this.element.innerHTML = (`
                <p class="TextMessage_p">${message}
                <button class="ContinuePopup_button" id="continue">Continue</button>
                </p>
                `)
        }
        else {
            //If first round of detection and was surface attack, disallow Dive Deep
            if (this.enc.round == 1 && this.attackDepth == "Surfaced"){
                message = "Escort is pinging us!";
                this.element.innerHTML = (`
                    <h3 class="HeaderMessage_h3">${message}</h3>
                    <button class="ContinuePopup_button" id="continue">Continue</button>
                    `)
            }
            message = "Escort is pinging us!";
            this.element.innerHTML = (`
                <h3 class="HeaderMessage_h3">${message}</h3>
                <button class="DiveDeepPopup_button" id="dive">Dive Deep</button>
                <button class="ContinuePopup_button" id="continue">Continue</button>
                `)
        }

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "continue") {
                //get selected value and close popup
                this.done();
            }
            else if (event.target.id == "dive") {
                this.enc.diveDeep();
                this.done();
            }
        })

        this.container.appendChild(this.element);
    }

    escortResults(results, majorDetection) {
        if (this.closeRangeCheck) {
            if (results == "Completely Undetected" || results == "Undetected") {
                this.element.innerHTML = (`
                    <p class="TextMessage_p">We've managed to remain undetected.
                    <button class="ContinuePopup_button" id="continue2">Continue</button>
                    </p>
                    `)
            }
            else {
                this.element.innerHTML = (`
                    <h3 class="HeaderMessage_h3">We've been detected!</h3>
                    <button class="ContinuePopup_button" id="continue2">Continue</button>
                    `)
            }
        }
        else {
            if (results == "Completely Undetected" || results == "Undetected") {
                this.element.innerHTML = (`
                    <p class="TextMessage_p">We've slipped away!
                    <button class="WaitPopup_button" id="continue2">Continue</button>
                    </p>
                    `)
            }
            else if (!majorDetection){
                this.element.innerHTML = (`
                    <h3 class="HeaderMessage_h3">We've been detected! Depth charges in the water!</h3>
                    <button class="ContinuePopup_button" id="continue2">Continue</button>
                    `)
            }
            else {
                this.element.innerHTML = (`
                    <h3 class="HeaderMessage_h3">Brace! Escort directly above us!</h3>
                    <button class="ContinuePopup_button" id="continue2">Continue</button>
                    `)
            }
        }

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "continue2") {
                this.done();
            }
        })

        this.container.appendChild(this.element);

    }

    //Displays third popup for damage results - only when detected
    damageResults(results) {
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Damage Report! </h3>
            <p class="DetectionTextMessage_p">${results} <br><br>
            <button class="ContinuePopup_button" id="continue2">Continue</button>
            </p>`)

        this.element.addEventListener("click", ()=> {
            this.done();
        })

        this.container.appendChild(this.element);
    }
    
    done(){
        this.element.remove();
        this.gm.setSubEventResolved(true);
    }
}