import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config();

const connectdb=async ()=>{
    try{

         const connect=await mongoose.connect("mongodb+srv://avanipoonthottam:bOdZIjh5DPnr0dF6@cluster0.850re.mongodb.net/Tiara")

       
        //  console.log(connect);
         
        
      console.log(`MongoDb connected:${connect.connection.host}`);

    }catch(error){
        console.error(error);
        process.exit(1);

    }
}

export default connectdb;
