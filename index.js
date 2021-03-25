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
    let { empname, empid, month, salary, Designation, pf, D_O_J, professionalTax } = req.body;
    if (!req.body) {
        res.send("missing details")
    }

    //Logic for salary details in payslip
    const basicPay = (0.40 * salary / 12).toFixed(2);
    const DA = (0.20 * salary / 12).toFixed(2);
    const HRA = (0.20 * salary / 12).toFixed(2);
    const specialAllowance = (0.20 * salary / 12).toFixed(2);
    const netpay = parseFloat(basicPay) + parseFloat(DA) + parseFloat(HRA) + parseFloat(specialAllowance);

    let PF = pf;//Let is used for re-assiging its value.
    //Applying checks on PF checkbox.
    if (PF == null) {

        PF = 0;
    }
    else {

        PF = req.body.pf;
    }

    //Formating salary month
    let monthDate = month;
    let newmonthDate = new Date(monthDate)
    let monthYear = newmonthDate.getFullYear()
    let getMonth = newmonthDate.toLocaleString('Default', { month: 'long' });
    let newDate = getMonth + "," + monthYear;

    let ProfessionalTax = professionalTax;
    //Applying checks on ProfessionalTax checkbox.
    if (ProfessionalTax == null) {
        //console.log('empty')
        ProfessionalTax = 0
    }
    else {
        ProfessionalTax = req.body.professionalTax;
    }

    let users = [
        {
            name: empname,
            empid: empid,
            Designation: Designation,
            month: newDate,
            salary: salary,
            basepay: basicPay,
            DA: DA,
            HRA: HRA,
            specialAllowance: specialAllowance,
            netPay: netpay,
            PF: PF,
            D_O_J: D_O_J,
            ProfessionalTax: ProfessionalTax
        },
    ];
    let pdfFilePath = `./output/Payslip-${empid}-${Math.floor(new Date().getTime() / 1000)}.pdf`;
    // var tempFilePath=`/Users/tjs3/Documents/pdf_generator/output/Payslip-${empid}-${Math.floor(new Date().getTime() / 1000)}.pdf`;
    let document = {
        html: html,
        data: {
            users: users
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
