class RoundResultsPopup{
    constructor(tv, gm, enc) {
        this.tv = tv;
        this.gm = gm;
        this.enc = enc;

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");

        this.element.classList.add("PatrolMessage");

        if (this.enc.firedFore || this.enc.firedAft) {
            this.showResultsTorpedo();
        }
        else {
            this.showResultsDeckGun();
        }
    }
    
    //Popup to show number of hits, missed and duds from resolution of torpedoes
    showResultsTorpedo(){
        //new div to add

        //See if all torpedoes missed first
        if (this.enc.roundHits == 0) {
            //Show message on all shots missed - vary between 1, 2 and 3+ torpedoes missing (Torpedo missed / both torpedoes missed / all missed)
        }

        //determine if a surface attack is possible (escorted or not, etc)
        if (this.shipList[0].getType() == "Escort" && this.timeOfDay == "Day") {
            this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">How should we engage?</h3>
            <p class="PatrolMessage_p">
            <input type="radio" id="PeriscopeDepth" name="depth" value="Periscope Depth" checked="checked">
            <label for="Periscope Depth">Periscope Depth</label><br>
            <input type="radio" id="RangeShort" name="range" value="Short Range">
            <label for="Short Range">${shortRange}</label>
            <input type="radio" id="RangeMedium" name="range" value="Medium Range" checked="checked">
            <label for="Medium Range">Medium Range</label>
            <input type="radio" id="RangeLong" name="range" value="Long Range">
            <label for="Long Range">Long Range</label>
            <button class="AttackPopup_button" id="attack">Continue</button>
            </p>
        `)}
        //not escorted or it is night
        else {
            this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">How should we engage?</h3>
            <p class="PatrolMessage_p">
            <input type="radio" id="PeriscopeDepth" name="depth" value="Periscope Depth" checked="checked">
            <label for="Periscope Depth">Periscope Depth</label>
            <input type="radio" id="SurfaceDepth" name="depth" value="Surfaced">
            <label for="Surfaced">Surfaced</label><br>
            <input type="radio" id="RangeShort" name="range" value="Short Range">
            <label for="Short Range">${shortRange}</label>
            <input type="radio" id="RangeMedium" name="range" value="Medium Range" checked="checked">
            <label for="Medium Range">Medium Range</label>
            <input type="radio" id="RangeLong" name="range" value="Long Range">
            <label for="Long Range">Long Range</label>
            <button class="AttackPopup_button" id="attack">Continue</button>
            </p>
        `)}

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "attack"){
                //get selected value and close popup
                this.done();
            }
        })

        this.container.appendChild(this.element);
    }
    
    done(){
        this.depth = document.querySelector('input[name="depth"]:checked').value;
        this.range = document.querySelector('input[name="range"]:checked').value;
        this.element.remove();
        this.gm.setEventResolved(true);
    }

    getDepth() {
        return this.depth;
    }

    getRange() {
        return this.range;
    }

}