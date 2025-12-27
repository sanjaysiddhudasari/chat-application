const mongoose=require('mongoose');

//for local testing 
const MONGO_URI='mongodb+srv://sanjaysiddhu999_db_user:ZsbSRthg9Qz4IC8l@cluster0.ix40ypj.mongodb.net/chatapp?appName=Cluster0'
// const MONGO_URI=process.env.MONGO_URI; 

const connectDB=async()=>{
    try{
        await mongoose.connect(MONGO_URI);
        console.log("connected");
    }catch (e){
        console.log('error');
    }
};

module.exports=connectDB;
