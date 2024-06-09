function d6Roll(){
    roll = Math.floor(Math.random() * (6 - 1)) + 1;
    return roll;
}

function d6Rollx2(){
    roll = d6Roll() + d6Roll();
    return roll;
}

function until(conditionFunction) {

    const poll = resolve => {
      if(conditionFunction()) resolve();
      else setTimeout(_ => poll(resolve), 400);
    }
  
    return new Promise(poll);
  }