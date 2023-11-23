const express  = require("express")
const app  =express()
const port = process.env.PORT || 5000
require ('dotenv').config()



app.get('/', (req, res) =>{
    res.send("Life Pulse is running")
})
app.listen(port, () =>{
    console.log(`The app is running on port ${port}`)
})