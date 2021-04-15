
let basic=(salary)=>{
    let basicpay=(0.40 * salary)
    return basicpay
}

let da=(salary)=>{
    let DA=(0.20 * salary)
    return DA;
}

let hra=(salary)=>{
    let HRA=(0.20 * salary)
    return HRA;
}

let special=(salary)=>{
    let Special=(0.20 * salary)
    return Special
}

let amountdata=(amt)=>{
    let amtdata=amt;
    amtdata=amtdata.toString();
    let lastThree = amtdata.substring(amtdata.length-3);
    let otherNumbers = amtdata.substring(0,amtdata.length-3);
    if(otherNumbers != '')
        lastThree = ',' + lastThree;
    var finaldata= otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return finaldata
}
module.exports={
    basic,
    da,
    hra,
    special,
    amountdata
};