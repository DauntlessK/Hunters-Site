class FollowPopup{
    constructor(tv, gm, enc) {
        this.tv = tv;
        this.gm = gm;
        this.enc = enc

        this.option = "";

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");

        this.element.classList.add("PatrolMessage");
        this.getDepthAndRangePopup();
    }
    
    //Popup to allow the player to choose a target to follow, or ignore and move on
    getDepthAndRangePopup(){

        //new div to add
        //Create html for options
        this.element.innerHTML = (`
        <h3 class="HeaderMessage_h3">Follow Orders?</h3>
        <p class="PatrolMessage_p">
        <input type="radio" id="Ship4" name="options" value="Ship4">
        <label for="Ship4">Ship 4</label>
        <input type="radio" id="Ship3" name="options" value="Ship3">
        <label for="Ship3">Ship 3</label>
        <input type="radio" id="Ship2" name="options" value="Ship2">
        <label for="Ship2">Ship 2</label>
        <input type="radio" id="Ship1" name="options" value="Ship1">
        <label for="Ship1">Ship 1</label>
        <input type="radio" id="Convoy" name="options" value="Convoy">
        <label for="Convoy">Convoy</label>
        <input type="radio" id="Ignore" name="options" value="Ignore">
        <label for="Ignore">Continue Patrol</label>
        <button class="AttackPopup_button" id="continue">Continue</button>
        </p>
        `)

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "continue"){
                //get selected value and close popup
                this.done();
            }
        })

        this.container.appendChild(this.element);

        //disable options based on ships present / able to follow\
        //First check if a convoy, and no sinkable ships present
        if (this.enc.encounterType == "Convoy") {
            document.getElementById("Convoy").style.visibility = "visible";
        }
        else {
            for (let i = 0; i < this.enc.shipList.length; i++) {
                if (this.enc.isEscorted()) {
                    continue;
                }
                if (!this.enc.shipList[i].sunk) {
                    var shipNo = "Ship" + i.toString();
                    document.getElementById(shipNo).style.visibility = "visible";
                    //change label
                }
            }
        }
    }
    
    done(){
        if (!this.tv.isPaused) {
            this.option = document.querySelector('input[name="options"]:checked').value;
            this.element.remove();
            this.gm.setEventResolved(true);
        }
    }

    getOption() {
        return this.option;
    }

}