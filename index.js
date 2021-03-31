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

const options = {
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
    let { employeeName,employeeID, month, salary, Designation, pf, D_O_J, professionalTax,accountNo,providentfundNo } = req.body;
    if (!req.body) {
        res.send("missing details")
    }

    //Logic for salary details in payslip
    const basicPay = payment.basic(salary);
    const DA = payment.da(salary);
    const HRA = payment.hra(salary);
    const specialAllowance = payment.special(salary) ;
    const netPay = parseFloat(basicPay) + parseFloat(DA) + parseFloat(HRA) + parseFloat(specialAllowance);
    let PF = pf;

    //Logic for formatting payment details
    const newbasicPay=payment.amountdata(basicPay);
    const newDA=payment.amountdata(DA);
    const newHRA=payment.amountdata(HRA);
    const newspecialAllowance=payment.amountdata(specialAllowance);
    const newnetPay=payment.amountdata(netPay)


    var providentFund=PF==null?0:req.body.pf;

    //Formating salary month
    let monthDate = month;
    let newmonthDate = new Date(monthDate)
    let monthYear = newmonthDate.getFullYear()
    let getMonth = newmonthDate.toLocaleString('Default', { month: 'long' });
    let newDate = getMonth + "," + monthYear;


    let ProfessionalTax = professionalTax;
    var newprofessionalTax=ProfessionalTax==null?0:req.body.professionalTax

    let users =[
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
            netPay:newnetPay,
            PF:providentFund,
            D_O_J,
            ProfessionalTax:newprofessionalTax,
            accountNo,
            providentfundNo
        }
    ];
    
    let pdfFilePath = `./output/Payslip-${employeeID}-${Math.floor(new Date().getTime() / 1000)}.pdf`;
    // var tempFilePath=`/Users/tjs3/Documents/pdf_generator/output/Payslip-${empid}-${Math.floor(new Date().getTime() / 1000)}.pdf`;
    let document = {
        html: html,
        data: {
            users
        },
        path: pdfFilePath,
        type: ""
    };
    pdf.create(document, options)
        .then(() => {
            let files = fs.createReadStream(pdfFilePath);
            res.writeHead(200,
                { 'Content-disposition': 'attachment; filename=payslip.pdf' }); //here you can specify file name
            files.pipe(res);
        })
        .catch((error) => {
            console.log(error)
        })
});

app.listen(port, () => {
    console.log(`Server is running at ${port}`);
});
