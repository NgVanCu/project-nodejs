require('dotenv').config()
const fileUpload = require('express-fileupload');
const express = require('express')
const cors = require('cors') 
const app = express()
const port = process.env.PORT || 8080;
app.use(fileUpload());
const apiRouter = require('./routes/api'); 
const connectDB = require('./configs/db')

app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

connectDB();



app.use('/api/v1', apiRouter);

app.listen(port, () => {
  console.log(`🚀 Server đang chạy tại port ${port}`)
})