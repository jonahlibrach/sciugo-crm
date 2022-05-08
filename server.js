const express = require('express')
const { MongoClient } = require('mongodb');
const app = express()
app.use(
  express.urlencoded({
    extended: true
  })
)
app.use(express.json())

const port = 4444;

const url = 'mongodb://localhost:27017'
const client = new MongoClient(url);
const dbName='crm';

app.post('/history', async (req, res) => {
  let d = new Date();
  console.log(d.getTime());
})

app.get('/objects/:objectType', async (req, res) => {
  let object = req.params.objectType;
  await client.connect();
  const db = client.db(dbName)
  const col = db.collection(object);
  const result = await col.find({}).toArray();
  res.send(JSON.stringify(result));
  console.log(result);
})

app.post('/add', async (req,res) => {
  console.log("RECEIVED REQUEST!");
  await client.connect();
  const db = client.db(dbName)
  let date = Date.now();
  console.log(req);
  console.log(Object.keys(req));
  console.log(req.body);
  if( !Array.isArray(req.body) ){
    let json = req.body;
    let { type } = json;
    console.log("TYPE IS: " + type);
    if( type === 'group' ){

      console.log(json);



      res.send({type:'success',message:"Arrived in group, but didn't write anything to db."});


    }else if( type === 'person' ){
    }else if( type === 'todo' ){
    
      let collection = json.type;
      let col = db.collection(collection);
      let result = await col.insertOne({
        ...json,
        date
      });

      console.log(result);
    }

    

  }
  
})

app.get('/test', async(req,res) => {
  console.log("RECEIVED SOMETHING!");
  res.send({message:'Test success.'});
})



app.get('/companies', async (req,res) => {
})

app.listen(port, async () => {
  console.log("Listening on port " + port + "...");
})
