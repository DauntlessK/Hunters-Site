class Ship {
    constructor(type, month, year) {
        this.type = type;
        this.G7aINCOMING = 0;
        this.G7eINCOMING = 0;
        this.dateSunk = "";
        this.monthSunk = month;
        this.yearSunk = year;
        this.loadResolved = false;   
        
        this.shipNames = "";

        this.getShip();
    }

    async getShip() {
        //set ship stats based on ship type, loop to get unique ship
        var notUniqueShip = true;
        while (notUniqueShip) {
            switch (this.type) {
                case "Small Freighter":
                    this.damage = 0;
                    this.hp = 2;
                    this.sunk = false;
                    this.clss = this.type;

                    //OPEN TXT?
                    console.log("OPEN TEXT");
                    var names = getDataFromTxt("data/SmallFreighter.txt", this);
                    await until(_ => this.loadResolved == true);
                    console.log("Resolved");
                    console.log(this.shipNames);
            }
        }
    }
}