
let basic = (salary) => {
    let basicpay = (0.40 * salary)
    return basicpay
}

let da = (salary) => {
    let DA = (0.20 * salary)
    return DA;
}

let hra = (salary) => {
    let HRA = (0.20 * salary)
    return HRA;
}

let special = (salary) => {
    let Special = (0.20 * salary)
    return Special
}

let amountdata = (amt) => {
    let amount = amt;
    amount = amount.toString();
    let lastThree = amount.substring(amount.length - 3);
    let otherNumbers = amount.substring(0, amount.length - 3);
    if (otherNumbers != '')
        lastThree = ',' + lastThree;
    var finalamount = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return finalamount;
}
module.exports = {
    basic,
    da,
    hra,
    special,
    amountdata
};