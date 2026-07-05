require('dotenv').config();
const mongoose = require('mongoose');

async function connectToDoDB()
{
 try 
 {
  const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
  console.log(`ToDo Database Connected Successfully!✅\nDB Host : ${connectionInstance.connection.host}`); 
 } 
 catch(e) 
 {
  console.error("MongoDB Core Connection Failure Error Stack:",e.message);
  process.exit(1);  
 }   
}

module.exports = connectToDoDB;