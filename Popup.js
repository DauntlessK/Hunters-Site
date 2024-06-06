class Popup{
    constructor(text, tv) {
        this.text = text;
        //this.onComplete = onConplete;
        this.element = null;
        this.tv = tv;
        this.tv.pauseGame();
        console.log("is constructed");
    }


    createElement() {
        //Create the element
        this.element = document.createElement("div");
        this.element.classList.add("TextMessage");

        this.element.innerHTML = (`
            <p class="TextMessage_p">${this.text}</p>
            <button class="TextMessage_button">Next</button>
        `)

        this.element.querySelector("button").addEventListener("click", ()=> {
            //close popup
            this.done();
        })
    }

    done(){
        this.element.remove();
        this.tv.unpauseGame();
    }

    init(container) {
        this.createElement();
        container.appendChild(this.element);
    }
}