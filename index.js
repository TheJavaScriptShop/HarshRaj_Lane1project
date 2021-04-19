const express = require('express');
const dotenv = require('dotenv');
const pdf = require("pdf-creator-node");
const fs = require("fs");
const path = require("path");
const bodyparser = require('body-parser')

const payment = require('./paymentLogic')

const app = express()
dotenv.config();
const port = process.env.PORT;
const html = fs.readFileSync(path.join(__dirname, "./public/template.html"), "utf8");
const urlencodedParser = bodyparser.urlencoded({ extended: false })
app.use(bodyparser.json())
app.use(express.static('public'))

const pdfOptions = {
    format: "A4",
    orientation: "portrait",
    border: "1mm",
};

//Serves resources from public folder
app.use(express.static(__dirname + 'public'));

//api to render form
app.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, 'public'))
})

//api to get response
app.post('/response', urlencodedParser, (req, res) => {
    let { employeeName, employeeID, month, salary, Designation, pf, doj, professionalTax, accountNo, providentfundNo, tds } = req.body;


    if (!req.body) {
        res.send("missing details")
    }

    //Logic for salary details in payslip
    const basicPay = payment.basic(salary);
    const da = payment.da(salary);
    const hra = payment.hra(salary);
    const specialAllowance = payment.special(salary);
    const calculatedEarning = parseFloat(basicPay) + parseFloat(da) + parseFloat(hra) + parseFloat(specialAllowance);
    let PF = pf;

    //Logic for formatting payment details

    const newbasicPay = payment.amountData(basicPay);
    const newDA = payment.amountData(da);
    const newHRA = payment.amountData(hra);
    const newspecialAllowance = payment.amountData(specialAllowance);
    const newtotalEarning = payment.amountData(calculatedEarning)


    //Formating salary month
    let monthDate = month;
    let newmonthDate = new Date(monthDate)
    let monthYear = newmonthDate.getFullYear()
    let getMonth = newmonthDate.toLocaleString('Default', { month: 'long' });
    let newDate = getMonth + ", " + monthYear;

    let providentFund = PF == null ? 0 : 250;
    let ProfessionalTax = professionalTax;
    let newprofessionalTax = ProfessionalTax == null ? 0 : 250
     console.log(tds)
    //Logic for total deductions and netPayment
    let newTDS = Number(tds)
    let deductions = newTDS + providentFund + newprofessionalTax

    const newtotalDeductions = payment.amountData(deductions);
    const totalPay = calculatedEarning - deductions;
    const netPay = payment.amountData(totalPay)
    newTDS = payment.amountData(newTDS)


    let user =
    {
        employeeName,
        employeeID,
        Designation,
        month: newDate,
        salary,
        basicPay: newbasicPay,
        DA: newDA,
        HRA: newHRA,
        specialAllowance: newspecialAllowance,
        totalEarning: newtotalEarning,
        PF: providentFund,

        doj,

        ProfessionalTax: newprofessionalTax,
        accountNo,
        providentfundNo,
        newTDS,
        totalDeductions: newtotalDeductions,
        netPay,
        host: process.env.URL
    }
    let pdfFilePath = `./output/Payslip-${employeeID}-${Math.floor(new Date().getTime() / 1000)}.pdf`;
    let document = {
        html: html,
        data: {
            user
        },
        path: pdfFilePath,
        type: ""
    };
    pdf.create(document, pdfOptions)
        .then(() => {
            let file = fs.createReadStream(pdfFilePath);
            res.writeHead(200,
                { 'Content-disposition': 'attachment; filename=payslip.pdf' }); //here you can specify file name
            file.pipe(res);
        })
        .catch((error) => {
            console.log(error)
        })
});

app.listen(port, () => {
    console.log(`Server is running at ${port}`);
});
