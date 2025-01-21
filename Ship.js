class Ship {
    constructor(gm, enc, type, month, year, shipsSunk, currentOrders, otherShip1, otherShip2, otherShip3) {
        this.gm = gm;
        this.enc = enc;

        this.type = type;
        this.name = name;
        this.hp = 5;
        this.damage = 0;
        this.sunk = false;
        this.GRT = 0;

        this.otherShip1 = otherShip1;
        this.otherShip2 = otherShip2;
        this.otherShip3 = otherShip3;

        this.isLoaded = false;
        
        this.G7aINCOMING = 0;
        this.G7eINCOMING = 0;
        this.deckGunINCOMING = 0;
        this.roundDuds = 0;
        this.roundHits = 0;
        this.roundDam = 0;
        this.roundSunk = false;

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
                if (this.shipsSunk[i].name == this.name || this.name == this.otherShip1 || this.name == this.otherShip2 || this.name == this.otherShip3 ) {
                    this.getShip();
                }
            }
        }

        this.isLoaded = true;
    }

    getName() {
        return this.name;
    }

    getGRT() {
        return this.GRT;
    }

    getGRTInt() {
        return parseInt(this.GRT);
    }

    getNameAndGRT() {
        return this.name + " - " + this.GRT;  
    }

    getType() {
        return this.type;
    }

    assignG7a() {
        this.G7aINCOMING++;
    }

    unassignG7a() {
        this.G7aINCOMING--;
    }

    assignG7e() {
        this.G7eINCOMING++;
    }

    unassignG7e() {
        this.G7eINCOMING--;
    }

    assignDeckGun(num) {
        this.deckGunINCOMING = num;
    }

    hasTorpedoesIncoming() {
        if (this.G7aINCOMING > 0 || this.G7eINCOMING > 0) {
            return true;
        }
        return false;
    }

    //Assigns damage to the ship, then checks for sinking
    takeDamage(num) {
        this.damage = this.damage + num;
        this.gm.damageDone += num;   //update global damage count
        this.roundDam += num;
        this.roundHits++;
        if (this.damage >= this.hp && !this.sunk) {
            this.sunk = true;
            this.roundSunk = true;
            this.gm.shipsSunk.push(this);
            this.gm.shipsSunkOnCurrentPatrol.push(this);
            this.enc.shipsSunkInEnc.push(this);
        }
    }
    
    clearRoundStats() {
        this.roundDuds = 0;
        this.roundHits = 0;
        this.roundDam = 0;
        this.roundSunk = false;
    }
}