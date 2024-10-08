const express  = require("express")
const app  =express()
const port = process.env.PORT || 5000
require ('dotenv').config()
const cors = require('cors')
const jwt = require("jsonwebtoken")

app.use(express.json())
app.use(cors())
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hxdwxas.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

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
    const premiumCollection = database.collection("premiums")
    const contactRequestCollection = database.collection("contactRequests")
    const userCollection = database.collection("users")
    const successCollection = database.collection("successStories")
 
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
app.get('/premiums' , async(req , res) => {
  const cursor = premiumCollection.find()
  const result = await cursor.toArray()
  res.send(result)
})
app.post('/premium' ,verifyToken, async(req , res) => {
  const premiumUser = req.body
  const query = {biodataId : req?.body?.biodataId}
  const isExisted = await premiumCollection.findOne(query)
  if(isExisted){
    res.send({message : "already included"})
    return
  }
  const result = await premiumCollection.insertOne(premiumUser)
  res.send(result)
})
app.get('/allCounts' , async(req , res) => {
  // const maleQuery = {biodataType : "Male"}
  // const femaleQuery = {biodataType : "Female"}
  
  const maleBiodata = await bioDataCollection.countDocuments({biodataType : "Male"})
  const femaleBiodata = await bioDataCollection.countDocuments({biodataType : "Female"})
  const premiumBiodata = await bioDataCollection.countDocuments({isPremium : true})
  const totalBiodata =await bioDataCollection.estimatedDocumentCount()
  const contactRequests = await contactRequestCollection.estimatedDocumentCount()
  const successStories = await successCollection.estimatedDocumentCount()
  res.send({totalBiodata , maleBiodata , femaleBiodata , contactRequests , premiumBiodata , successStories})
  
})
app.get('/checkPremium/:email' , async(req , res) => {
   const email =req.params.email
   const query = {email : email}

   const biodata = await bioDataCollection.findOne(query)
   const user  = await userCollection.findOne(query)
   if(biodata?.isPremium || user?.isPremium){
    return res.send({isPremium : true})
   }
    res.send({isPremium : false})
})
app.patch('/biodata/premium/:email',verifyToken, async(req , res) => {
  const email = req.params.email
  // if(req.decoded?.email !== email){
  //   return res.status(403).send({message : "Forbidden Access"})
  // }
  // const query = {email : email}
  // const 
  const filter = {email : email}
  const options = { upsert: true }
  const updatedUser  = {
    $set : {
     isPremium : true
    }
  }
  const result = await bioDataCollection.updateOne(filter, updatedUser, options);
  res.send(result)
})
// app.post('/pre')
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
  const query1 = {biodataId : req?.body?.biodataId}
  const query2 = {userEmail : req?.body?.userEmail}
  const isExisted = await favoritesCollection.findOne(query1)
  const isExistedRequesterEmail = await favoritesCollection.findOne(query2)
  if(isExisted && isExistedRequesterEmail){
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
app.get('/contactRequests' , verifyToken , async(req , res) => {
 const cursor = contactRequestCollection.find()
  const result = await cursor.toArray()
  res.send(result)
})
app.post('/contactRequest' ,verifyToken, async(req , res) => {
   const contactRequest = req.body
   const result = await contactRequestCollection.insertOne(contactRequest)
   res.send(result)
})
app.get('/contactRequests' ,verifyToken, async(req, res) => {
  const cursor = contactRequestCollection.find()
  const result = await cursor.toArray()
  res.send(result)
})
app.get('/contactRequests/:email' ,verifyToken, async(req, res) => {
 const email = req.params.email
 const query = {selfEmail : email}
  const result = await contactRequestCollection.find(query).toArray()
  res.send(result)
})
app.delete('/contactRequest/:email' ,verifyToken,async(req,res)=>{
  const email = req.params.email
  const query = {selfEmail : email}
  const result = await contactRequestCollection.deleteOne(query)
  res.send(result)
})
app.patch('/contactRequest/:id' , verifyToken , async(req , res) => {
  const id = req.params.id
  const filter = {_id : new ObjectId(id)}
  const options = { upsert: true }
  const updatedUser  = {
    $set : {
     status : "approved"
    }
  }
  const result = await contactRequestCollection.updateOne(filter, updatedUser, options)
  res.send(result)
})


app.post("/create-payment-intent",verifyToken, async (req, res) => {
  const { price } = req.body;
  const amount = parseInt(price*100)
  console.log(amount)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    payment_method_types :['card']
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  })
});
app.post('/user/:email' , async(req , res) => {
  const newUser = req.body
    const email = req.params?.email
    const query = {email:email}
    console.log(query)
    const isExisted  =await userCollection.findOne(query)
    if(isExisted){
      return res.send({massage:"No second time insert in database"})
    }
    const result = await userCollection.insertOne(newUser)
 return res.send(result)
})
app.get('/users' ,verifyToken, async(req , res) => {
  const cursor = userCollection.find()
  const result = await cursor.toArray()
  res.send(result)
})
app.get('/user/:name' ,verifyToken, async(req , res) => {
  const name = req.params.name
  const query = {name : name}
  const result = await userCollection.find(query).toArray()
  res.send(result)
})
app.patch('/makeAdmin/:id' ,verifyToken, async(req, res) => {
  const id = req.params.id
  const filter = {_id : new ObjectId(id)}
  const options = { upsert: true };

  const updatedUser  = {
    $set : {
      role:'admin'
    }
  }
  const result = await userCollection.updateOne(filter, updatedUser, options);
    
  res.send(result)
})
app.get('/checkAdmin/:email' ,verifyToken, async(req, res) => {
  const email = req.params.email
  console.log(req.decoded)
  if(email !== req.decoded?.email){
   
    return res.status(403).send("forbidden")
  }
  const query = {email : email}
  const user = await userCollection.findOne(query)
  let admin = false
  if(user?.role){
   admin = true
  }
  res.send({admin})
})
app.patch('/user/:id' ,verifyToken, async(req , res) =>{
  const id = req.params.id
  const filter = {_id: new ObjectId(id)}
  const options = { upsert: true };

  const updatedUser  = {
    $set : {
      isPremium : true
    }
  }
  const result = await userCollection.updateOne(filter, updatedUser, options);
  res.send(result)
})
app.get('/successStories' , async(req , res) => {
  const cursor = successCollection.find()
  const result = await cursor.toArray()
  res.send(result)
})
app.post('/successStory' ,verifyToken, async(req , res) => {
  const successStory = req.body
  const result = await successCollection.insertOne(successStory)
  res.send(result)
})
app.post('/jwt' , async(req , res) => {
  const user = req.body
  const token = jwt.sign(user , process.env.TOKEN_SECRET)
  res.send({token})
})

    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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
