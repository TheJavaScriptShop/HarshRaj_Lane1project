const express=require('express');
const app= express()

const dotenv=require('dotenv');
dotenv.config();
const port=process.env.PORT;

const bodyparser=require('body-parser')
app.use(bodyparser.json())
var urlencodedParser = bodyparser.urlencoded({ extended: false })  

app.use(express.static('public'))


app.get('/form',(req,res)=>{                                //api to render form
    res.sendFile(path.join(__dirname,'public'))
})


app.post('/response',urlencodedParser,(req,res)=>{          //api to get response
    const {empname,empid,month,salary}=req.body;
    if(!req.body)
    {
        res.send("missing details")
    }
    
    console.log(req.body);
    console.log(empname);
    res.status(200).send("your request has been accepted")
})



// app.get("/",(req,res)=>{
//     res.send("hello");
// })


app.listen(port,()=>{
    console.log(`Server is running at ${port}`);
})