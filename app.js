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
    await mongoose.connect("mongodb+srv://devwithtobi:Samuel9721@cluster0.c7nxjo2.mongodb.net/myNoteApp?retryWrites=true&w=majority").then(console.log("DB connected and running")).catch(err=>console.log(err.message))
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
        
        const listname = await NoteCollection.find({name:listName})
        
        if(username.length > 0){
            if(listName && (listname.length == 0)) {  //check if the list name is not in list collections
                const user = await User.findOne({user:userName})
                const newNoteList = new NoteCollection({name:listName})
                newNoteList.user = user
                await newNoteList.save()
                res.redirect("/"+userName+"/"+listName)
            }
            else if(!listName){
                
                res.redirect("/"+userName)
            }
            else if(listName && (listname.length > 0)){
                res.redirect("/"+userName+"/"+listName)
            }
        }       
        else{
            const newUser = new User({user:userName})
            await newUser.save()
            if (listName){
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
        const user = await User.findOne({user:(_.capitalize(req.params.user))})
        
        
        if (user){
            console.log()
            const list = [{
                name:"You are yet to select list"
            }]
            let notes = await NoteCollection.find({user:user})
            res.render("note", {list:list, lists:notes, user:user.user, userId:user._id})
        }
        
        
    }
})

app.get("/:user/:list", function(req, res){
    

    
    async function get(){
        const username = _.capitalize(req.params.user)
        const listname = _.capitalize(req.params.list)
        const user = await User.findOne({user:username})
        let notes = await NoteCollection.find({user:user})
        let note = await NoteCollection.find({name:listname, user:user})
        res.render("note", {list:note, lists:notes, user:user.user, userId:user._id})
                
    }
    get().catch(err=>console.log(err.message))


})

// Craete new List (NoteCollections)

app.post("/addList", function(req, res){
    


    post().catch(err=> console.log(err.message))

    async function post(){
        const listName = _.capitalize(req.body.newList)
        const userName = req.body.user
        const user = await User.findOne({_id: userName})
        const listSearch = await NoteCollection.findOne({name:listName, user:user})
        if (listSearch == null){
            const newList = new NoteCollection({name: listName})
            newList.user = user
            //console.log(newList)
            await newList.save()

        }
        res.redirect("/"+user.user+"/"+listName)
        
    }
})


app.post("/delete", function(req, res){
    post()
    async function post(){
        const id = req.body.ID;
        const userID = req.body.userID;
        console.log(id)
        console.log(userID)
        
        const user = await User.findOne({_id:userID})
        const deleteItem= await NoteCollection.findByIdAndDelete(id);
        console.log(user)
        res.redirect("/"+user.user)
        
    }
})


app.post("/findList", function(req, res){
    post()
    async function post(){
        const listID = await NoteCollection.findOne({_id:req.body.listID})
        const user = listID.user.user
        res.redirect("/"+user+"/"+listID.name)
        
    }
})


app.post("/addNote", function(req, res){
    
    const title = _.capitalize(req.body.title)
    const content = _.capitalize(req.body.content)

    post()
    async function post(){
        const list = await NoteCollection.findOne({_id:req.body.listID})
        const newNote = new Note({
            title : title , content : content
        }) //create new note
        await newNote.save()
        list.notes.push(newNote)
        await list.save()
        res.redirect("/"+list.user.user+"/"+list.name)
    }
})







//create express server connection

app.listen(process.env.PORT || 3000, ()=>console.log("Server started"))