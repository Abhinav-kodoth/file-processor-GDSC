const express=require("express");



const app=express();

const path = require("path");

app.use(express.static(path.join(__dirname, "frontend")));


app.use(express.json());

const jobRoute=require("./routes/job");
app.use("/jobs",jobRoute);


require("./worker/processor");
//bg work started

app.get("/",(req,res)=>{
    res.send("API Running");
});

const PORT=3000;

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});