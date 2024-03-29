const express = require('express');
const app = express()
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT;

const pdf = require("pdf-creator-node");
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "./public/template.html"), "utf8");

const bodyparser = require('body-parser')
app.use(bodyparser.json())
const urlencodedParser = bodyparser.urlencoded({ extended: false })

app.use(express.static('public'))

const payment = require('./paymentLogic')

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

const moneyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
});

//api to get response
app.post('/response', urlencodedParser, (req, res) => {
    let { employeeName, employeeID, month, salary, Designation, pf, D_O_J, professionalTax, accountNo, providentfundNo, TDS } = req.body;

    if (!req.body) {
        res.send("missing details")
    }

    //Logic for salary details in payslip
    const basicPay = payment.basic(salary);
    const DA = payment.da(salary);
    const HRA = payment.hra(salary);
    const specialAllowance = payment.special(salary);
    const calculatedEarning = parseFloat(basicPay) + parseFloat(DA) + parseFloat(HRA) + parseFloat(specialAllowance);
    let PF = pf;

    //Logic for formatting payment details
    const newbasicPay = moneyFormatter.format(basicPay.toFixed(2));
    const newDA = moneyFormatter.format(DA.toFixed(2));
    const newHRA = moneyFormatter.format(HRA.toFixed(2));
    const newspecialAllowance = moneyFormatter.format(specialAllowance.toFixed(2));
    const newtotalEarning = moneyFormatter.format(calculatedEarning.toFixed(2));

    //Formating salary month
    let monthDate = month;
    let newmonthDate = new Date(monthDate)
    let monthYear = newmonthDate.getFullYear()
    let getMonth = newmonthDate.toLocaleString('Default', { month: 'long' });
    let newDate = getMonth + ", " + monthYear;

    let providentFund = PF == null ? 0 : 250;
    let ProfessionalTax = professionalTax;
    let newprofessionalTax = ProfessionalTax == null ? 0 : 250

    //Logic for total deductions and netPayment
    let newTDS = Number(TDS)
    let deductions = newTDS + providentFund + newprofessionalTax
    const newtotalDeductions = moneyFormatter.format(deductions.toFixed(2));
    const totalPay = (calculatedEarning - deductions);
    const netPay = moneyFormatter.format(totalPay.toFixed(2));
    newTDS = moneyFormatter.format(newTDS.toFixed(2))

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
        D_O_J,
        ProfessionalTax: newprofessionalTax,
        accountNo,
        providentfundNo,
        newTDS,
        totalDeductions: newtotalDeductions,
        netPay,
        host: process.env.URL
    }
    const bitmap = fs.readFileSync(__dirname + "/public/banner-with-logo.png");
    const logo = bitmap.toString('base64');
    user.banner = logo;
    const fileName = user.month.toString().replace(/,/g, "_").replace(" ", "");
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
                { 'Content-disposition': `attachment; filename=${fileName}_payslip.pdf` }); //here you can specify file name
            file.pipe(res);
        })
        .catch((error) => {
            console.log(error)
        })
});

app.listen(port, () => {
    console.log(`Server is running at ${port}`);
});
