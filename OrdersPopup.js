class OrdersPopup{
    constructor(tv, gm, uniqueOrders, isPicking) {
        this.tv = tv;
        this.gm = gm;
        this.uniqueOrders = uniqueOrders;
        this.uniqueOrders.shift();
        this.tv.pauseGame();

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");
        this.element.classList.add("TextMessage");

        if (isPicking){
            this.pickOrders();
        }
        else {
            this.orders();
        }
    }

    orders(){
        //Message at start of patrol to show orders
        var message = "";
        switch (this.gm.currentOrders){
            case "British Isles":
                message = " is to proceed to the enclosed area to patrol the British Isles."
                break;
            case "West African Coast":
            case "Spanish Coast":
                message = " is hereby ordered to patrol off the " + this.gm.currentOrders + "."
                break;
            case "British Isles(Minelaying)":
                message = " is directed to take the loaded mines to the enclosed target area and lay the mines, then proceed to patrol the British Isles."
                break;
            case "Norway":
                message = " has been assigned to a patrol off Norway. Proceed to the enclosed target area."
                break;
            case "British Isles(Abwehr Agent Delivery":
                message = " has been entrusted to safely deliver the onboard Abwehr agent to the enclosed area, then proceed to patrol the British Isles."
                break;
            case "Atlantic":
                message = " is hereby ordered to patrol the enclosed area in the Mid-Atlantic."
                break;
            case "Atlantic(Wolfpack)":
                message = " has been assigned to a Wolfpack. Proceed to the area enclosed in these orders and maintain contact with the Wolfpack."
                break;
            case "Mediterranean":
                message = " has been reassigned to the Mediterranean. Immediately upon receipt of this order, proceed through the Gibraltar Strait to join the Mediterranean fleet."
                break;
        }
        

        //new div to add
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Incoming Orders from BdU
            <p class="TextMessage_p">${this.gm.getFullDate()}<br>
            ${this.gm.getLRankAndName()}<br><br>
            ${this.gm.getFullUboatID()}${message}<br><br>Happy Hunting.</p>
            <button class="TextMessage_button">Next</button>
        `)

        this.container.appendChild(this.element);

        this.element.querySelector("button").addEventListener("click", ()=> {
            //close popup
            this.done();
        })
    }

    pickOrders(){
        var elementsArray = [];

        //build html buttons for unique orders in patrol array
        for (let i = 0; i < this.uniqueOrders.length; i++){
            elementsArray[i] = document.createElement("button");
            elementsArray[i].classList.add("Option_button");
            elementsArray[i].id = this.uniqueOrders[i];
            elementsArray[i].innerHTML = (`
                ${this.uniqueOrders[i]}
                `)      
        }

        //main body text
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Choose Your Orders
            <p class="TextMessage_p">You are being given the opportunity to pick your orders. Choose from below.<br>
            <br>
            </p>
        `)
        this.container.appendChild(this.element);

        //add buttons to popup
        for (let i = 0; i < elementsArray.length; i++){
            this.element.appendChild(elementsArray[i]);
        }

        this.element.addEventListener("click", ()=> {
            //determine which button was clicked
            if (this.uniqueOrders.includes(event.target.id)){
                this.gm.currentOrders = event.target.id;
                this.gm.ordersPopup(this.uniqueOrders, false)
                this.done();
            }

        });
    }

    done(){
        this.element.remove();
        this.gm.eventResolved = true;
        this.tv.unpauseGame();
    }

}