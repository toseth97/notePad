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
    },
    status: {
        type:Boolean,
        default:true
    },

})

const userSchema = new mongoose.Schema({
    user:String, 
})

const noteSchema = new mongoose.Schema({
    name: String,
    notes:[noteTitleSChema],
    user:userSchema
})


// model for note document from above schema

const User = mongoose.model("User", userSchema)
const NoteCollection = mongoose.model("noteCollection", noteSchema)
const Note = mongoose.model("note", noteTitleSChema)


//get request to default page (Welcome Page)

app.get("/", function(req, res){
    res.render("live")
})

app.post("/", function(req, res){
    const listName = _.capitalize(req.body.listName)
    const userName = _.capitalize(req.body.userName)
    
    post()
    async function post(){
        const username = await User.find({user:userName})
        console.log(await User.find({user:username}).noteList)
        const listname = await NoteCollection.find({name:listName})
        console.log(username)
        console.log(listname)
        if(username.length > 0){
            if(listName && (listname.length == 0)) {  //check if the list name is not in list collections
                const user = await User.findOne({user:userName})
                const newNoteList = new NoteCollection({name:listName})
                newNoteList.user = user
                await newNoteList.save()
                res.redirect("/"+userName+"/"+listName)
            }
            else if(listName && (listname.length > 0)){
                console.log("1")
                res.redirect("/"+userName+"/"+listName)
            }
        }else{
            const newUser = new User({user:userName})
            await newUser.save()
            if (listName){
                const newUser = new User({user:userName})
                const newNoteList = new NoteCollection({name:listName})
                newNoteList.user = newUser
                
                await newNoteList.save()
                res.redirect("/"+(newUser.user)+"/"+listName)
            }
            res.redirect("/"+(newUser.user))
            
        }
            
            
    }
})

app.get("/:user", function(req, res){

    get().catch(err=>err.message)

    async function get(){
        const user = await User.find({user:(req.params.user)})
        res.render("note", {user:(user.user), title:(user.user)})
    }
})

app.get("/:user/:list", function(req, res){
    const username = req.params.user
    const listname = req.params.list

    res.render("note")
})







//create express server connection

app.listen(process.env.PORT || 3000, ()=>console.log("Server started"))