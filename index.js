const express  = require("express")
const app  =express()
const port = process.env.PORT || 5000
require ('dotenv').config()
const cors = require('cors')
const jwt = require("jsonwebtoken")
app.use(express.json())
app.use(cors())
 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hxdwxas.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
// const generateBioDataId = async(req, res, next) =>{
//   const biodata = req.body
//   if(bioDataCollection){
//   const biodataCount = await bioDataCollection.estimatedDocumentCount()
//   console.log(biodataCount)
//   if(biodataCount && !biodata?.biodataId){
//     biodata.biodataId = biodataCount + 1
//     res.send(biodata?.biodataId)
//     next()
//     return
//   }
//   biodata.biodataId = 1
//   res.send(biodata?.biodataId)
//   next()
//   return
//   }
 
//   next()

// }
const verifyToken = (req , res ,next) => {
  console.log(req.headers.authorization)
  if(!req.headers.authorization){
  return res.status(401).send({message : "Unauthorized Access"})
  }
 const token = req.headers.authorization.split(' ')[1]
 console.log("verify token is" , token)
 jwt.verify(token , process.env.TOKEN_SECRET , (err , decoded) => {
  if(err){
    return res.status(401).send({message : "Unauthorized Access"})
  }
  req.decoded = decoded;
  next();
 })

}

async function run() {
  try {
    const database = client.db("lifePulsDB")
    const bioDataCollection = database.collection("biodatas")
    const favoritesCollection = database.collection("favorites")
 
    // await client.connect();
app.get('/allBiodata' , async(req , res) => {
  const cursor = bioDataCollection.find()
  const result = await cursor.toArray()
  res.send(result)
})


app.get('/countBiodata' , async(req , res) => {
  const count = await bioDataCollection.estimatedDocumentCount()
  console.log(count)
  res.send({count})
})
app.get('/paginationBiodata', async(req, res) => {
  const skipPages = parseInt(req.query.skipPages)
  const perPageData = parseInt(req.query.pageData)
  console.log(skipPages , perPageData)
    const result = await bioDataCollection.find().skip(skipPages*perPageData).limit(perPageData).toArray();
    res.send(result);
})
 

app.get('/biodata/:email',verifyToken, async(req,res)=>{
  const paramsEmail = req.params?.email
  // console.log(req.decoded?.email)
  // if(req.decoded?.email !== paramsEmail){
  //   return res.status(403).send({message : "Forbidden Access"})
  // }
  const email = paramsEmail
  const query = {email : email}
  const result =await bioDataCollection.findOne(query)
  res.send(result)
})
app.put('/biodata', async (req , res)=>{
  const biodata = req.body
  const filter = {email : biodata?.email}
  const biodataCount = await bioDataCollection.estimatedDocumentCount()
  const query = {email : biodata?.email}
  const existedBiodata = await bioDataCollection.findOne(query)
   console.log(biodataCount)
  console.log(filter)
  const options = { upsert: true}

  const updateDoc = {
    $set: {
      biodataId : existedBiodata?.biodataId || biodataCount + 1,
      DateOfBirth:biodata?.DateOfBirth,
      age:biodata?.age,
      biodataType:biodata?.biodataType,
      division:biodata?.division,
      email:biodata?.email,
      expectedPartnerAge:biodata?.expectedPartnerAge,
      expectedPartnerHeight:biodata?.expectedPartnerHeight,
      expectedPartnerWeight:biodata?.expectedPartnerWeight,
      fathersName:biodata?.fathersName,
      height:biodata?.height,
      mobileNumber:biodata?.mobileNumber,
      mothersName:biodata?.mothersName,
      name:biodata?.name,
      occupation:biodata?.occupation,
      profileLink:biodata?.profileLink,
      race:biodata?.race,
      weight:biodata?.weight
}

}

const updateResult = await bioDataCollection.updateOne(filter, updateDoc, options)
console.log(updateResult)
res.send(updateResult)


})
app.get('/favorites/:email' , verifyToken, async(req , res) => {
  const email = req.params.email
   console.log(req.decoded?.email)
  if(req.decoded?.email !== email){
    return res.status(403).send({message : "Forbidden Access"})
  }
  
  const query = {userEmail : email}
  const result = await favoritesCollection.find(query).toArray()
  res.send(result)
})
app.post('/favorite',verifyToken, async(req, res) => {
  const favorite = req.body
  const query = {biodataId : req?.body?.biodataId}
  const isExisted = await favoritesCollection.findOne(query)
  if(isExisted){
    res.send({message : "already included"})
    return
  }

 
  const result =await favoritesCollection.insertOne(favorite)
  res.send(result)
})
app.delete('/favorite/:id' ,verifyToken, async(req , res) => {
  const id = req.params.id
  const query = {_id : new ObjectId(id)}
  const result = await favoritesCollection.deleteOne(query)
  res.send(result)
})

app.post('/jwt' , async(req , res) => {
  const user = req.body
  const token = jwt.sign(user , process.env.TOKEN_SECRET)
  res.send({token})
})

    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } 
  
  finally {
  
  }
}
run().catch(console.dir);



app.get('/', (req, res) =>{
    res.send("Life Pulse is running")
})
app.listen(port, () =>{
    console.log(`The app is running on port ${port}`)
})
// lifePuls
// sLdlzfpZAdpHquyq