
function basic(salary)
{
    const basicpay=(0.40 * salary).toFixed(2)
    return basicpay;
}
function da(salary)
{
    const basicpay=(0.20 * salary).toFixed(2)
    return basicpay;
}
function hra(salary)
{
    const basicpay=(0.20 * salary).toFixed(2)
    return basicpay;
}function special(salary)
{
    const basicpay=(0.20 * salary).toFixed(2)
    return basicpay;
}

module.exports={
    basic,
    da,
    hra,
    special,
};