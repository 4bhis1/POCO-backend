const express = require("express")
const { submitService } = require("./src/Services/submit.service")

const app = express()



app.get("/login",(req, res)=>{})

app.post("/users/:userId/submit",submitService)


app.listen(4010,()=>{
    console.log("PO-KO running on port -> 4010")
})