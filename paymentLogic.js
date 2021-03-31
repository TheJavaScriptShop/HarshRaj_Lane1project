
function basic(salary)
{
    var basicpay=(0.40 * salary)
    return basicpay;
}
function da(salary)
{
    const DA=(0.20 * salary)
    return DA;
}
function hra(salary)
{
    const HRA=(0.20 * salary)
    return HRA;
}
function special(salary)
{
    const Special=(0.20 * salary)
    return Special;
}

function amountdata(amt){
    var z=amt;
    z=z.toString();
    var lastThree = z.substring(z.length-3);
    var otherNumbers = z.substring(0,z.length-3);
    if(otherNumbers != '')
        lastThree = ',' + lastThree;
    var result= otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return result
}

module.exports={
    basic,
    da,
    hra,
    special,
    amountdata
};