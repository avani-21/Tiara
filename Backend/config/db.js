import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config();

const connectdb=async ()=>{
    try{
         const connect=await mongoose.connect('mongodb://localhost:27017/Tiara')

      console.log(`MongoDb connected:${connect.connection.host}`);

    }catch(error){
        console.error(error);
        process.exist(1)
    }
}

export default connectdb;
