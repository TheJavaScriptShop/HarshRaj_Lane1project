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

const payment=require('./paymentlogic')

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


    let { employeeName,employeeID, month, salary, Designation,pf,dateOfJoining, professionalTax,accountNo,providentfundNo,TDS } = req.body;

    if (!req.body) {
        res.send("missing details")
    }

    //Logic for salary details in payslip
    const basicPay = payment.basic(salary);
    const DA = payment.da(salary);
    const HRA = payment.hra(salary);
    const specialAllowance = payment.special(salary) ;
    const calculatedEarning = parseFloat(basicPay) + parseFloat(DA) + parseFloat(HRA) + parseFloat(specialAllowance);
    let PF = pf;

    //Logic for formatting payment details
    const newbasicPay=payment.amountdata(basicPay);
    const newDA=payment.amountdata(DA);
    const newHRA=payment.amountdata(HRA);
    const newspecialAllowance=payment.amountdata(specialAllowance);
    const newtotalEarning=payment.amountdata(calculatedEarning)

    //Formating salary month
    let monthDate = month;
    let newmonthDate = new Date(monthDate)
    let monthYear = newmonthDate.getFullYear()
    let getMonth = newmonthDate.toLocaleString('Default', { month: 'long' });
    let newDate = getMonth + ", " + monthYear;

    let providentFund=PF==null?0:250;
    let ProfessionalTax = professionalTax;
    let newprofessionalTax=ProfessionalTax==null?0:250

    //Logic for total deductions and netPayment
    let newTDS=Number(TDS)
    let deductions=newTDS+providentFund+newprofessionalTax
    const newtotalDeductions=payment.amountdata(deductions);
    const totalPay=calculatedEarning-deductions;
    const netPay=payment.amountdata(totalPay)
    newTDS=payment.amountdata(newTDS)

    let user =
        {
            employeeName,
            employeeID,
            Designation,
            month: newDate,
            salary,
            basicPay:newbasicPay,
            DA:newDA,
            HRA:newHRA,
            specialAllowance:newspecialAllowance,
            totalEarning:newtotalEarning,
            PF:providentFund,
            dateOfJoining,
            ProfessionalTax:newprofessionalTax,
            accountNo,
            providentfundNo,
            newTDS,
            totalDeductions:newtotalDeductions,
            netPay,
            host:process.env.URL
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
