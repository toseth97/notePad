const mongoose = require("mongoose")
const express = require("express")
const bodyParser = require("body-parser")
const _ = require("lodash")
//initiate express js

const app = express()


//calling function for mongo connection
connectDB().catch(err=>console.log(err.message))

//connect to mongoDB
async function connectDB(){
    await mongoose.connect("mongodb://127.0.0.1:27017/myNoteApp").then(console.log("DB connected and running")).catch(err=>console.log(err.message))
}

//setting middleware for express

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))


// creating note document schema
const noteTitleSChema = new mongoose.Schema({
    title:String,
    content: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const noteSchema = new mongoose.Schema({
    name: String,
    notes:[noteTitleSChema]
})
// model for note document from above schema

const Note = mongoose.model("note", noteSchema)

//get request to default page (Welcome Page)

app.get("/", function(req, res){
    res.render("live")
})

app.post("/", function(req, res){
    console.log(req.body.name)
    const name = _.toUpper(req.body.name)
    
    (async function(){
            const note = await Note.find({title:name})
            if(note.length > 0){
                res.send(note)
            }else{
                const newNote = await Note.create({name:name})
                res.send(newNote)
            }
            
            
        })()
})

app.get("/:params", function(req, res){

    const name = req.params
    console.log(name)
    // (async function(){
    //     const note = await Note.find()
    //     res.render("note", {note:note})
    // })()
})







//create express server connection

app.listen(process.env.PORT || 3000, ()=>console.log("Server started"))