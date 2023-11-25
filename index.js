const express  = require("express")
const app  =express()
const port = process.env.PORT || 5000
require ('dotenv').config()
const cors = require('cors')
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

async function run() {
  try {
    const database = client.db("lifePulsDB")
    const bioDataCollection = database.collection("biodatas")
   app.post('/biodata', async(req , res) => {
    const biodata = req.body
    // const query = {biodataId : biodata?.biodataId}
    // console.log(query)
    // const isExisted =await bioDataCollection.findOne(query)
    if( biodata?.biodataId){
      const filter = {biodataId : biodata?.biodataId}
      console.log(filter)
      const options = { upsert: true }
      const updateDoc = {
        $set: {
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
      // set end
 
    const updateResult = await bioDataCollection.updateOne(filter, updateDoc, options)
    res.send(updateResult)
    return;
   }
  //  const biodataCount = await bioDataCollection.estimatedDocumentCount()
  //  console.log(biodataCount)
  //  if(biodataCount){
  //    biodata.biodataId = biodataCount + 1
  //    res.send(biodata?.biodataId)
  //  }



//   const filter = {biodataId : biodata?.biodataId}
//   console.log(filter)
//   const options = { upsert: true }
//   const updateDoc = {
//     $set: {
     
//    }
// }
   
   
    const postResult =await bioDataCollection.insertOne(biodata)
    res.send(postResult)
  

   })
    // await client.connect();
app.put('/biodata', async (req , res)=>{
  const biodata = req.body
  const filter = {email : biodata?.email}
  const biodataCount = await bioDataCollection.estimatedDocumentCount()
  const query = {email : biodata?.email}
  const existedBiodata = await bioDataCollection.findOne(query)
   console.log(biodataCount)
  console.log(filter)
  const options = { upsert: true }

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
res.send(updateResult)


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