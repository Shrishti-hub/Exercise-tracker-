const express = require('express')
const app = express()
const mongoose = require('mongoose');
const mongodb = require('mongodb')
const shortid = require('shortid');
const cors = require('cors')
require('dotenv').config()
//database connection
mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors())
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded());
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

var ExerciseUser = mongoose.model('ExerciseUser',new mongoose.Schema({
  _id : String,
  username : {type:String,unique: true}
}));

app.post('/api/users',function(req,res){
  console.log("active post request");
  console.log(req.body);
  let ID = mongoose.Types.ObjectId();
  let exerciseUser = new ExerciseUser({
    username : req.body.username,
    _id : ID
  })
  exerciseUser.save(function(err,doc){
    if(err){
      console.log(err);
    }
    res.json({
      "username" : exerciseUser.username,
      "_id" : exerciseUser["_id"]
    });
  });
})

app.get('/api/users',(req,res)=>{
  ExerciseUser.find({},(err,exerciseUsers)=>{
    res.json(exerciseUsers);
  })
})
var DescriptionUser = mongoose.model('DescriptionUser',new mongoose.Schema({
  userId : String,
  description : String,
  duration : String,
  data : Date
}));
app.post('/api/users/:_id/exercises',(req,res)=>{
   const {userId,description,duration,date} = req.body;
   ExerciseUser.findById(userId,(err,data)=>{
     console.log(data);
     if(!data){
       res.send("Unknown userId");
     }else{
       const username = data.username;
       let newexercise = new DescriptionUser({
        userId,description,duration,date
     });
     newexercise.save((err,data)=>{
       res.json({userId,username,description,duration,date})
     })
    }
   })   
})

app.get('/api/users/:_id/logs'/*?{userId}[&from][&to][&limit]*/, (req, res) => {
  ExerciseUser.findById(req.query.userId).exec()
  .then( user => {
    let newLog = user.log;
    if (req.query.from){
      newLog = newLog.filter( x =>  x.date.getTime() > new Date(req.query.from).getTime() );}
    if (req.query.to)
      newLog = newLog.filter( x => x.date.getTime() < new Date(req.query.to).getTime());
    if (req.query.limit)
      newLog = newLog.slice(0, req.query.limit > newLog.length ? newLog.length : req.query.limit);
    user.log = newLog;
    let temp = user.toJSON();
    temp['count'] = newLog.length;

    return temp;
  })
  .then( result => res.json(result))
  .catch(err => res.json(err));
    
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
