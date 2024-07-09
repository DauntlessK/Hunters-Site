class AttackDepthAndRangePopup{
    constructor(tv, gm, enc, shipList, timeOfDay) {
        this.tv = tv;
        this.gm = gm;
        this.enc = enc
        this.shipList = shipList;
        this.timeOfDay = timeOfDay;

        this.depth = null;
        this.range = null;

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");

        this.element.classList.add("PatrolMessage");
        this.getDepthAndRangePopup();
    }
    
    //Popup to allow the player to choose depth, disallowing certain selections
    getDepthAndRangePopup(){
        var shortRange = "Short Range";
        //determine if a surface attack is possible (escorted or not, etc)
        if (this.shipList[0].getType() == "Escort") {
            shortRange = "WARNING! Short Range"
        }

        //determine if a surface attack is possible (escorted or not, etc)
        if (this.shipList[0].getType() == "Escort") {
            console.log("Disabling Surface due to Escort");
            document.getElementById("SurfaceDepth").disabled = true;
        }

        //new div to add
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">How should we engage?</h3>
            <p class="PatrolMessage_p">
            <input type="radio" id="PeriscopeDepth" name="depth" value="Periscope Depth" checked="checked">
            <label for="Periscope Depth">Periscore Depth</label>
            <input type="radio" id="SufaceDepth" name="depth" value="Surfaced">
            <label for="Surfaced">Surfaced</label><br>
            <input type="radio" id="RangeShort" name="range" value="Short Range">
            <label for="Short Range">${shortRange}</label>
            <input type="radio" id="RangeMedium" name="range" value="Medium Range" checked="checked">
            <label for="Medium Range">Medium Range</label>
            <input type="radio" id="RangeLong" name="range" value="Long Range">
            <label for="Long Range">Long Range</label>
            <button class="AttackPopup_button" id="attack">Continue</button>
            </p>
        `)

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