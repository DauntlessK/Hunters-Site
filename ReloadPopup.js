class ReloadPopup{
    constructor(tv, gm){
        this.tv = tv;
        this.gm = gm;
        
        this.tv.pauseGame();
    
        const container = document.querySelector(".game-container");
    
        //Create the element
        this.element = document.createElement("div");
        this.element.classList.add("TextMessage");
    
        this.reload();
    
        container.appendChild(this.element);
    }

    reload(){
        //Popup to select loadout of torpedoes

        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Tube Reload Selection
            <p class="TextMessage_p">${this.gm.sub.G7a()} has been assigned<span class= "G7a"> ${this.gm.sub.G7aStarting} G7a (steam) torpedoes</span> and
            <span class="G7e">${this.gm.sub.G7eStarting} G7e (electric) torpedoes</span>.<br>You may adjust this spread by +/- ${this.gm.sub.torpedo_type_spread}.<br>
            <span class="G7a">G7a: </span><button class="Option_button" id="DecG7a"><---</button><span class="G7a"> ${this.currentG7a} </span><button class="Option_button" id="IncG7a">---></button><br>
            <span class="G7e">G7e: </span><button class="Option_button" id="DecG7e"><---</button><span class="G7e"> ${this.currentG7e} </span><button class="Option_button" id="IncG7e">---></button><br>
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
            else if (event.target.id == "done"){
                //close resupply window (complete) and set total torpedo counts to selected totals
                this.done();
                this.gm.sub.G7a = this.currentG7a;
                this.gm.sub.G7e = this.currentG7e;
                return;
            }
            const subResupply = new ResupplyPopup(this.tv, this.gm, this.currentG7a, this.currentG7e);
            this.element.remove();
        });
    }

}