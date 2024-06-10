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
            <p class="TextMessage_p">Fore Torpedoes: <span class="G7a">${this.gm.sub.reloads_forward_G7a}</span>      <span class="G7e">${this.gm.sub.reloads_forward_G7e}</span><br>
            <p class="TextMessage_p">Aft Torpedoes:  <span class="G7a">${this.gm.sub.reloads_aft_G7a}</span>      <span class="G7e">${this.gm.sub.reloads_aft_G7e}</span><br>
            <img src="images/ui/TorpButton.png">
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