import express from "express";
import 'dotenv/config' 
// const express = require('express')
const app = express()
const port = process.env.PORT

app.get('/', (req, res) => {
  res.send('Hello World! hehe')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})