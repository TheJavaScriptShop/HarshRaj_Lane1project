const express=require('express');
const app= express()

var pdf=require("pdf-creator-node");    //pdf-creator npm module
var fs=require("fs");
var path=require("path");
var html=fs.readFileSync(path.join(__dirname,"./public/template.html"),"utf8");




const dotenv=require('dotenv');
dotenv.config();
const port=process.env.PORT;

const bodyparser=require('body-parser')
app.use(bodyparser.json())
var urlencodedParser = bodyparser.urlencoded({ extended: false })  

app.use(express.static('public'))


var options={                        //options for pdf
    format:"A3",
    orientation:"potrait",
    border:"10mm"
};




app.get('/form',(req,res)=>{                                //api to render form
    res.sendFile(path.join(__dirname,'public'))
})


app.post('/response',urlencodedParser,(req,res)=>{          //api to get response
    const {empname,empid,month,salary}=req.body;
    if(!req.body)
    {
        res.send("missing details")
    }
    var users=[                                //assigned user data to users object
        {
            name:empname,
            empid:empid,
            month:month,
            salary:salary
        }
    ];
    var document={                             //document object for pdf
        html:html,
        data:{
          users:users
        },
        header: {
            height: "45mm",
            contents: '<div style="text-align: center;">Harsh</div>'
        },
        footer: {
            height: "28mm",
            contents: {
                first: 'Cover page',
                2: 'Second page', // Any page number is working. 1-based index
                default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                last: 'Last Page'
            }
        },
        path:"./output/Payslip.pdf",              //path where pdf will be stored
        type:"pdf"
    };
    console.log(document.data.users);    //for debugging purpose

pdf.create(document,options)          //function which create pdf
.then((res)=>{
console.log(res);

})
.catch((error)=>{
console.log(error)
})

    console.log(req.body);
    console.log(empname);
    res.status(200).send("your request has been accepted")
   // res.sendFile(path.join(__dirname,'output'))
})



// app.get("/",(req,res)=>{
//     res.send("hello");
// })


app.listen(port,()=>{
    console.log(`Server is running at ${port}`);
})