class Ship {
    constructor(type, month, year, shipsSunk, currentOrders) {
        this.type = type;
        this.name = name;
        this.hp = 0;
        this.damage = 0;
        this.GRT = 0;
        
        this.G7aINCOMING = 0;
        this.G7eINCOMING = 0;

        this.dateSunk = "";
        this.monthSunk = month;
        this.yearSunk = year;
        this.shipsSunk = shipsSunk; 
        this.currentOrders = currentOrders;

        this.getShip();
    }

    //set ship stats based on ship type. Called again if ship name is not unqiue
    async getShip() {
        var entry = "";     //used for initial name/GRT array
        var newEntry = [];  //used for split array

        switch (this.type) {
            case "Small Freighter":
                this.damage = 0;
                this.hp = 2;
                this.sunk = false;
                this.clss = this.type;                

                //Get freighter name & GRT
                var names = await getDataFromTxt("data/SmallFreighter.txt");
                if (this.currentOrders == "North America" || this.currentOrders == "Caribbean") {
                    entry = names[randomNum(101, 120)];
                }
                else {
                    entry = names[randomNum(1, 100)];
                }
                newEntry = entry.split("-");
                this.name = newEntry[0];
                this.GRT = newEntry[1];
                break;
            case "Large Freighter":
            case "Tanker":
                this.clss = this.type;
                this.sunk = false;
                this.damage = 0;

                //get correct name list
                var names = [];
                if (this.type == "Large Freighter") {
                    names = await getDataFromTxt("data/LargeFreighter.txt");
                }
                else {
                    names = await getDataFromTxt("data/Tanker.txt");
                }

                //Get freighter name & GRT
                if (this.currentOrders == "North America" || this.currentOrders == "Caribbean") {
                    entry = names[randomNum(101, 120)];
                }
                else {
                    entry = names[randomNum(1, 100)];
                }
                newEntry = entry.split("-");
                this.name = newEntry[0];
                this.GRT = newEntry[1];

                if (this.GRT > 10000) {
                    this.hp = 4;
                }
                else {
                    this.hp = 3;
                }
                break;
            case "Escort":
                this.damage = 0;
                this.hp = 4;
                this.sunk = false;                

                //Get name & GRT
                var names = await getDataFromTxt("data/Escort.txt");
                if (this.currentOrders == "North America" || this.currentOrders == "Caribbean") {
                    entry = names[randomNum(670, 700)];
                }
                else {
                    entry = names[randomNum(1, 669)];
                }
                newEntry = entry.split("#");
                this.name = newEntry[0];
                this.clss = newEntry[1]
                this.GRT = newEntry[2];
                break;
            case "Capital Ship":
                this.damage = 0;
                this.hp = 5;
                this.sunk = false;                

                //Get name & GRT
                var names = await getDataFromTxt("data/CapitalShip.txt");
                entry = names[randomNum(1, 10)];
                newEntry = entry.split("#");
                this.name = newEntry[0];
                this.clss = newEntry[1]
                this.GRT = newEntry[2];
                break;
        }

        //ensure name is unique, if not, call getShip again
        if (this.shipsSunk.length != 0) {
            for (let i = 0; i < this.shipsSunk.length; i++) {
                if (this.shipsSunk[i].name == this.name) {
                    this.getShip();
                }
            }
        }
    }

    getName() {
        return this.name;
    }

    getGRT() {
        return this.GRT;
    }

    getNameAndGRT() {
        return this.name + " - " + this.GRT;  
    }

    getType() {
        return this.type;
    }

    assignG7a() {
        this.G7aINCOMING++;
        console.log(this.G7aINCOMING);
    }

    unassignG7a() {
        this.G7aINCOMING--;
    }

    assignG7a() {
        this.G7eINCOMING++;
    }

    unassignG7a() {
        this.G7eINCOMING--;
    }
}