class Patrol{
    constructor(gm){
        this.gm = gm;

        this.getPatrol();
    }

    getPatrolLength(patrol){
        //Determines full length of a given patrol (number of on station steps + all transit steps
        switch (patrol) {
            case "North America":
            case  "Caribbean":
                return this.gm.sub.patrol_length - 1 + 8;  // NA patrol has 1 less on station patrol + 2 BoB + EXTRA 2 transits
            case _:
                return this.gm.sub.patrol_length + 4;
        }
    }

    getPatrol(pickingPatrol){
        //Gets patrol based on date, type, permanent assignments, etc from patrol text files.

        var patrolChart = null;
        if (this.gm.date_year == 1939 || (this.gm.date_month <= 2 && this.gm.date_year == 1940)){patrolChart = "PatrolChart1.txt";}   // 1939 - Mar 1940 
        else if (this.gm.date_month > 2 && this.gm.date_month <= 5 && this.gm.date_year == 1940){patrolChart = "PatrolChart2.txt";}   // 1940 - Apr - Jun    
        else if (this.gm.date_month >= 6 && this.gm.date_month <= 11 && this.gm.date_year == 1940){patrolChart = "PatrolChart3.txt";} // 1940 - Jul - Dec 
        else if (this.gm.date_month >= 0 && this.gm.date_month <= 5 && this.gm.date_year == 1941){patrolChart = "PatrolChart4.txt";}  // 1941 - Jan - Jun
        else if (this.gm.date_month >= 6 && this.gm.date_month <= 11 && this.gm.date_year == 1941){patrolChart = "PatrolChart5.txt";} // 1941 - Jul - Dec
        else if (this.gm.date_month >= 0 && this.gm.date_month <= 5 && this.gm.date_year == 1942){patrolChart = "PatrolChart6.txt";}  // 1942 - Jan - Jun
        else if (this.gm.date_month >= 6 && this.gm.date_month <= 11 && this.gm.date_year == 1942){patrolChart = "PatrolChart7.txt";} // 1942 - Jul - Dec
        else if (this.gm.date_year == 1943){patrolChart = "PatrolChart8.txt";}                                                        // 1943
        else{
            console.log("Error getting patrol chart .txt file.")
        }

        const ordersRoll = d6Rollx2();
        const textFile = "data/" + patrolChart;
        console.log(textFile);

        this.getData(textFile);
        //fetch(textFile).then(this.convertData()).then(this.processData());

    }

    getData(textFile) {
        const myRequest = new Request(textFile);
        var patrol;

        fetch(myRequest)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error, status = ${response.status}`);
            }
            return response.text();
          })
          .then((text) => {
            console.log(text);
            patrol = text;
          })
          .catch((error) => {
            patrol = `Error: ${error.message}`;
          });
      }

    /**with open(patrolChart, "r") as fp:
            lines = fp.readlines()
            if pickingPatrol:
                #get unique list of orders, then print them and ask for input
                uniqueOrders = []
                for x in lines:
                    x = x.rstrip('\r\n')
                    if x not in uniqueOrders:
                        uniqueOrders.append(x)
                for x in range(len(uniqueOrders)):
                    count = x + 1
                    tp = str(count) + ") " + uniqueOrders[x]
                    print(tp)
                inpNum = getInputNum("Pick your orders: ", 1, len(uniqueOrders))
                orders = uniqueOrders[inpNum - 1]
            else:
                orders = lines[ordersRoll - 2]

        # strip any stray returns that may have gotten into the orders string
        orders = orders.strip('\n')

        orders = this.validatePatrol(orders, pickingPatrol)

        this.currentOrders = orders*/
}