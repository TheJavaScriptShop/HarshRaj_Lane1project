const express=require('express');
const app= express()
const dotenv=require('dotenv');
dotenv.config();
const port=process.env.PORT;

const pdf=require("pdf-creator-node");
const fs=require("fs");
const path=require("path");
const html=fs.readFileSync(path.join(__dirname,"./public/template.html"),"utf8");

const bodyparser=require('body-parser')
app.use(bodyparser.json())
const urlencodedParser = bodyparser.urlencoded({ extended: false })

app.use(express.static('public'))

const pdfoptions={
    format: "A4",
    orientation: "portrait",
    border: "1mm",
};

//Serves resources from public folder
app.use(express.static(__dirname + 'public'));

//api to render form
app.get('/form',(req,res)=>{
    res.sendFile(path.join(__dirname,'public'))
})

//api to get response
app.post('/response',urlencodedParser,(req,res)=>{
        let {empname,empid,month,salary}=req.body;
        if(!req.body)
         {
          res.send("missing details")
         }
        let users=[
            {
                name:empname,
                empid:empid,
                month:month,
                salary:salary
            }
        ];
      let pdfFilePath=`./output/Payslip-${empid}-${Math.floor(new Date().getTime() / 1000)}.pdf`;
        let pdfdocument={
            html:html,
            data:{
            users:users
            },
            path: pdfFilePath,
            type:""
        };
       pdf.create(pdfdocument,pdfoptions)
       .then(()=>{
            let files = fs.createReadStream(pdfFilePath);
            res.writeHead(200,
          {'Content-disposition': 'attachment; filename=payslip.pdf'}); //here you can specify file name
           files.pipe(res);
        })
       .catch((error)=>{
       console.log(error)
       })
});

app.listen(port,()=>{
    console.log(`Server is running at ${port}`);
});
