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

const options={
    format: "A4",
    orientation: "portrait",
    border: "1mm",
};

app.use(express.static(__dirname + 'public')); //Serves resources from public folder

app.get('/form',(req,res)=>{                                //api to render form
    res.sendFile(path.join(__dirname,'public'))
})

app.post('/response',urlencodedParser,(req,res)=>{          //api to get response
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
     // var tempFilePath=`/Users/tjs3/Documents/pdf_generator/output/Payslip-${empid}-${Math.floor(new Date().getTime() / 1000)}.pdf`;
        let document={
            html:html,
            data:{
            users:users
            },
            path: pdfFilePath,
            type:""
        };
       pdf.create(document,options)
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
