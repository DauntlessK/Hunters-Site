class Popup{
    constructor({text}) {
        this.text = text;
        //this.onComplete = onConplete;
        this.element = null;
        console.log("created popup");
    }


    createElement() {
        //Create the element
        this.element = document.createElement("div");
        this.element.classList.add("TextMessage");

        this.element.innerHTML = (`
            <p class="TextMessage_p">${this.text}</p>
            <button class="TextMessage_button">Next</button>
        `)
    }

    init(container) {
        this.createElement();
        container.appendChild(this.element);
    }
}