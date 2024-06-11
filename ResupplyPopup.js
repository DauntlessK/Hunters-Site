class ResupplyPopup{
    constructor(tv, gm, currentG7a, currentG7e, current_aftG7a, current_aftG7e){
        this.tv = tv;
        this.gm = gm;
        this.currentG7a = currentG7a;
        this.currentG7e = currentG7e;
        this.maxG7a = this.gm.sub.G7aStarting + this.gm.sub.torpedo_type_spread;
        this.minG7a = this.gm.sub.G7aStarting - this.gm.sub.torpedo_type_spread;
        this.maxG7e = this.gm.sub.G7eStarting + this.gm.sub.torpedo_type_spread;
        this.minG7e = this.gm.sub.G7eStarting - this.gm.sub.torpedo_type_spread;
        this.current_aftG7a = current_aftG7a;
        this.current_aftG7e = current_aftG7e;
        this.currentForeG7a = this.currentG7a - this.current_aftG7a;
        this.currentForeG7e = this.currentG7e - this.current_aftG7e;

        this.tv.pauseGame();

        const container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");
        this.element.classList.add("TextMessage");

        //hide last reload button if there is no last reload
        if (this.gm.sub.lastLoadoutForward_G7a == 0){
            this.subResupply();
        }
        else{
            this.subResupplyWithReloadButton();
        }

        container.appendChild(this.element);
    }

    subResupplyWithReloadButton() {
        //Popup to select loadout of torpedoes

        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Port Resupply
            <p class="TextMessage_p">${this.gm.getFullUboatID()} has been assigned<span class= "G7a"> ${this.gm.sub.G7aStarting} G7a (steam) torpedoes</span> and
            <span class="G7e">${this.gm.sub.G7eStarting} G7e (electric) torpedoes</span>.<br>You may adjust this spread by +/- ${this.gm.sub.torpedo_type_spread}.<br>
            <span class="G7a">G7a: </span><button class="Option_button" id="DecG7a"><---</button><span class="G7a"> ${this.currentG7a} </span><button class="Option_button" id="IncG7a">---></button><br>
            <span class="G7e">G7e: </span><button class="Option_button" id="DecG7e"><---</button><span class="G7e"> ${this.currentG7e} </span><button class="Option_button" id="IncG7e">---></button><br>
            <br>
            Fore Torpedoes:    <span class="G7a">${this.currentForeG7a}</span>      <span class="G7e">${this.currentForeG7e}</span><br>
            Aft Torpedoes: (${this.gm.sub.reserves_aft + this.gm.sub.aft_tubes}): <button class="option_button" id="IncG7aAFT"><span class="G7a" id="IncG7aAFT">${this.current_aftG7a}</span></button>
              <button class="option_button" id="IncG7eAFT"><span class="G7e" id="IncG7eAFT">${this.current_aftG7e}</span></button>
                (Click to increase a given aft reserve torpedo type and decrease the other)
            </p>
            <button class="AutoReload" id="AutoReload"> Use Last Reload </button>
            <button class="TextMessage_button" id="done">Done</button>
        `)

        this.element.addEventListener("click", ()=> {
            //determine which button was clicked
            if (event.target.id == "DecG7a" && this.currentG7a !== this.minG7a){
                this.currentG7a--;
                this.currentG7e++;
            }
            else if (event.target.id == "IncG7a" && this.currentG7a !== this.maxG7a){
                this.currentG7a++;
                this.currentG7e--;
            }
            else if (event.target.id == "DecG7e" && this.currentG7e !== this.minG7e){
                this.currentG7a++;
                this.currentG7e--;
            }
            else if (event.target.id == "IncG7e" && this.currentG7e !== this.maxG7e){
                this.currentG7a--;
                this.currentG7e++;
            }
            else if (event.target.id == "IncG7aAFT"){
                if (this.current_aftG7e > 0){
                    this.current_aftG7a++;
                    this.current_aftG7e--;
                }
            }
            else if (event.target.id == "IncG7eAFT"){
                if (this.current_aftG7a > 0){
                    this.current_aftG7a--;
                    this.current_aftG7e++;
                }
            }
            else if (event.target.id == "AutoReload"){
                this.currentG7a = this.gm.sub.lastLoadoutReloads_forward_G7a;
                this.currentG7e = this.gm.sub.lastLoadoutReloads_forward_G7e;
                this.current_aftG7a = this.gm.sub.lastLoadoutReloads_aft_G7a;
                this.current_aftG7e = this.gm.sub.lastLoadoutReloads_aft_G7e;
            }
            else if (event.target.id == "done"){
                //close resupply window (complete) and set total torpedo counts to selected totals
                this.done();
                this.gm.sub.G7a = this.currentG7a;
                this.gm.sub.G7e = this.currentG7e;
                this.gm.sub.reloads_forward_G7a = this.currentG7a - this.current_aftG7a;
                this.gm.sub.reloads_forward_G7e = this.currentG7e - this.current_aftG7e;
                this.gm.sub.reloads_aft_G7a = this.current_aftG7a;
                this.gm.sub.reloads_aft_G7e = this.current_aftG7e;
                return;
            }
            const subResupply = new ResupplyPopup(this.tv, this.gm, this.currentG7a, this.currentG7e, this.current_aftG7a, this.current_aftG7e);
            this.element.remove();
        });
    }

    subResupply() {
        //Popup to select loadout of torpedoes

        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Port Resupply
            <p class="TextMessage_p">${this.gm.getFullUboatID()} has been assigned<span class= "G7a"> ${this.gm.sub.G7aStarting} G7a (steam) torpedoes</span> and
            <span class="G7e">${this.gm.sub.G7eStarting} G7e (electric) torpedoes</span>.<br>You may adjust this spread by +/- ${this.gm.sub.torpedo_type_spread}.<br>
            <span class="G7a">G7a: </span><button class="Option_button" id="DecG7a"><---</button><span class="G7a"> ${this.currentG7a} </span><button class="Option_button" id="IncG7a">---></button><br>
            <span class="G7e">G7e: </span><button class="Option_button" id="DecG7e"><---</button><span class="G7e"> ${this.currentG7e} </span><button class="Option_button" id="IncG7e">---></button><br>
            <br>
            Fore Torpedoes:    <span class="G7a">${this.currentForeG7a}</span>      <span class="G7e">${this.currentForeG7e}</span><br>
            Aft Torpedoes: (${this.gm.sub.reserves_aft + this.gm.sub.aft_tubes}): <button class="option_button" id="IncG7aAFT"><span class="G7a" id="IncG7aAFT">${this.current_aftG7a}</span></button>
              <button class="option_button" id="IncG7eAFT"><span class="G7e" id="IncG7eAFT">${this.current_aftG7e}</span></button>
                (Click to increase a given aft reserve torpedo type and decrease the other)
            </p>
            <button class="TextMessage_button" id="done">Done</button>
        `)

        this.element.addEventListener("click", ()=> {
            //determine which button was clicked
            if (event.target.id == "DecG7a" && this.currentG7a !== this.minG7a){
                this.currentG7a--;
                this.currentG7e++;
            }
            else if (event.target.id == "IncG7a" && this.currentG7a !== this.maxG7a){
                this.currentG7a++;
                this.currentG7e--;
            }
            else if (event.target.id == "DecG7e" && this.currentG7e !== this.minG7e){
                this.currentG7a++;
                this.currentG7e--;
            }
            else if (event.target.id == "IncG7e" && this.currentG7e !== this.maxG7e){
                this.currentG7a--;
                this.currentG7e++;
            }
            else if (event.target.id == "IncG7aAFT"){
                if (this.current_aftG7e > 0){
                    this.current_aftG7a++;
                    this.current_aftG7e--;
                }
            }
            else if (event.target.id == "IncG7eAFT"){
                if (this.current_aftG7a > 0){
                    this.current_aftG7a--;
                    this.current_aftG7e++;
                }
            }
            else if (event.target.id == "done"){
                //close resupply window (complete) and set total torpedo counts to selected totals
                
                this.gm.sub.G7a = this.currentG7a;
                this.gm.sub.G7e = this.currentG7e;
                this.gm.sub.reloads_forward_G7a = this.currentG7a - this.current_aftG7a;
                this.gm.sub.reloads_forward_G7e = this.currentG7e - this.current_aftG7e;
                this.gm.sub.reloads_aft_G7a = this.current_aftG7a;
                this.gm.sub.reloads_aft_G7e = this.current_aftG7e;
                this.done();
                return;
            }
            const subResupply = new ResupplyPopup(this.tv, this.gm, this.currentG7a, this.currentG7e, this.current_aftG7a, this.current_aftG7e);
            this.element.remove();
        });
    }

    done(){
        this.element.remove();
        this.tv.changeScene("Port");
        this.tv.mainUI.reloadMode();
        //this.gm.sub.torpedoReload(2, 2, 1, 1);
        //reloadpopup = new ReloadPopup(this.tv, this.gm);
    }
}
