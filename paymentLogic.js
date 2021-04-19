const basic = (salary) => {
    let basicpay = (0.40 * salary)
    return basicpay
}

const da = (salary) => {
    let DA = (0.20 * salary)
    return DA;
}

const hra = (salary) => {
    let HRA = (0.20 * salary)
    return HRA;
}

const special = (salary) => {
    let Special = (0.20 * salary)
    return Special
}

const amountData = (amt) => {
    let amount = amt;
    amount = amount.toString();
    let lastThreeDigits = amount.substring(amount.length-3);
    let otherNumbers = amount.substring(0,amount.length-3);
    if(otherNumbers != '')
        lastThreeDigits = ',' + lastThreeDigits;
    let finalAmount = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThreeDigits;
    return finalAmount;
}

module.exports = {
    basic,
    da,
    hra,
    special,
    amountData
};