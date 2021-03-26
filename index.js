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

const optionsPdf = {
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
    let { employeeName, empployeeId, month, salary, designation, pf, doj, professionalTax } = req.body;
    if (!req.body) {
        res.send("missing details!!")
    }

    //Logic for salary details in payslip
    const basicPay = (0.40 * salary / 12).toFixed(2);
    const da = (0.20 * salary / 12).toFixed(2);
    const hra = (0.20 * salary / 12).toFixed(2);
    const specialAllowance = (0.20 * salary / 12).toFixed(2);
    const netPay = parseFloat(basicPay) + parseFloat(da) + parseFloat(hra) + parseFloat(specialAllowance);

    providentFund = pf == null ? 0 : 250;
    professionalTax = professionalTax == null ? 0 : 250;

    //Formating salary month
    let monthDate = month;
    let newMonthDate = new Date(monthDate)
    let monthYear = newMonthDate.getFullYear()
    let getMonth = newMonthDate.toLocaleString('Default', { month: 'long' });
    let newDate = getMonth + ", " + monthYear;

    let user =
    {
        name: employeeName,
        empid: empployeeId,
        designation,
        month: newDate,
        salary: salary,
        basicPay,
        da,
        hra,
        specialAllowance,
        netPay,
        providentFund,
        doj,
        professionalTax
    };

    let pdfFilePath = `./output/Payslip-${empployeeId}-${Math.floor(new Date().getTime() / 1000)}.pdf`;
    let document = {
        html: html,
        data: { user },
        path: pdfFilePath,
    };

    pdf.create(document, optionsPdf)
        .then(() => {
            let fileStream = fs.createReadStream(pdfFilePath);
            res.writeHead(200,
                //here you can specify file name
                { 'Content-disposition': 'attachment; filename=payslip.pdf' });
            fileStream.pipe(res);
        })
        .catch((error) => {
            console.log(error)
        })
});

app.listen(port, () => {
    console.log(`Server is running at ${port}`);
});
