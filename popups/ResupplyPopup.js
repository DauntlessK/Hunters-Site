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

        this.tv.pauseGame(true);

        const container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");
        this.element.classList.add("TextMessage");

        this.resupplyTypeSelection();

        container.appendChild(this.element);
    }

    resupplyTypeSelection() {
        //First popup- to determine if player would like a "preset" easy loadout, or a custom loadout. Custom loadout loads methods below.
        //Preset loadouts determine G7a / G7e balance, and automatically assign aft torpedoes as well - decided against allowing them to set rear torpedoes
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Port Resupply
            <p class="TextMessage_p">Choose a preset torpedo loadout, or customize.</p> <br>
            <button class="G7aLoadout" id="G7aLoadout">G7a Steam max loadout</button>
            <button class="G7eLoadout" id="G7eLoadout">G7e Electric max Loadout</button>
            <button class="BalLoadout" id="BalLoadout">Balanced Loadout</button>
            <button class="Custom" id="Custom">Custom Loadout</button>
        `)

        this.element.addEventListener("click", ()=> {
            //determine which button was clicked
            if (event.target.id == "G7aLoadout"){
                this.gm.sub.G7a = this.maxG7a;
                this.gm.sub.G7e = this.minG7e;
                this.gm.sub.reloads_forward_G7a = this.maxG7a - this.current_aftG7a;
                this.gm.sub.reloads_forward_G7e = this.minG7e - this.current_aftG7e;
                this.gm.sub.reloads_aft_G7a = this.current_aftG7a;
                this.gm.sub.reloads_aft_G7e = this.current_aftG7e;
                this.done();
                this.element.remove();
            }
            else if (event.target.id == "G7eLoadout"){
                this.gm.sub.G7a = this.minG7a;
                this.gm.sub.G7e = this.maxG7e;
                this.gm.sub.reloads_forward_G7a = this.minG7a - this.current_aftG7a;
                this.gm.sub.reloads_forward_G7e = this.maxG7e - this.current_aftG7e;
                this.gm.sub.reloads_aft_G7a = this.current_aftG7a;
                this.gm.sub.reloads_aft_G7e = this.current_aftG7e;
                this.done();
                this.element.remove();
            }
            else if (event.target.id == "BalLoadout"){
                this.gm.sub.G7a = this.currentG7a;
                this.gm.sub.G7e = this.currentG7e;
                this.gm.sub.reloads_forward_G7a = this.currentG7a - this.current_aftG7a;
                this.gm.sub.reloads_forward_G7e = this.currentG7e - this.current_aftG7e;
                this.gm.sub.reloads_aft_G7a = this.current_aftG7a;
                this.gm.sub.reloads_aft_G7e = this.current_aftG7e;
                this.done();
                this.element.remove();
            }
            else if (event.target.id == "Custom"){
                this.element.remove();
                const subCustomResupply = new ResupplyCustomPopup(this.tv, this.gm, this.currentG7a, this.currentG7e, this.current_aftG7a, this.current_aftG7e);
                //this.done();
            }
            
            //const subResupply = new ResupplyPopup(this.tv, this.gm, this.currentG7a, this.currentG7e, this.current_aftG7a, this.current_aftG7e);
        });
    }

    subResupply() {
        //Popup to select loadout of torpedoes NOT USED HERE- SEE RESUPPLY CUSTOM

        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Port Resupply
            <p class="TextMessage_p">${this.gm.getFullUboatID()} has been assigned<span class= "G7a"> ${this.gm.sub.G7aStarting}x G7a (steam) torpedoes</span> and
            <span class="G7e">${this.gm.sub.G7eStarting}x G7e (electric) torpedoes</span>.<br>You may adjust this spread by +/- ${this.gm.sub.torpedo_type_spread}.<br>
            <span class="G7a">G7a: </span><button class="Arrow_button" id="DecG7a">3 3</button><span class="G7a"> ${this.currentG7a} </span><button class="Arrow_button" id="IncG7a">4 4</button><br>
            <span class="G7e">G7e: </span><button class="Arrow_button" id="DecG7e">3 3</button><span class="G7e"> ${this.currentG7e} </span><button class="Arrow_button" id="IncG7e">4 4</button><br>
            <br>
            Fore Torpedoes (${this.gm.sub.reserves_fore}):  <span class="G7a">${this.currentForeG7a}</span>      <span class="G7e">${this.currentForeG7e}</span><br>
            Aft  Torpedoes (${this.gm.sub.reserves_aft + this.gm.sub.aft_tubes}): <button class="option_button" id="IncG7aAFT"><span class="G7a" id="IncG7aAFT">${this.current_aftG7a}</span></button>
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
        this.tv.pauseGame(false);
        this.tv.mainUI.reloadMode();
        return;
    }
}
