const colors = require('colors')
const connectDB = require('./config/db');
const express = require('express')

// Connect to database
connectDB();

const app = express()

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.listen(process.env.PORT, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`)
})