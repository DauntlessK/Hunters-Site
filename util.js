function d6Roll(){
    roll = Math.floor(Math.random() * (6 - 1)) + 1;
    return roll;
}

function d6Rollx2(){
    roll = d6Roll() + d6Roll();
    return roll;
}