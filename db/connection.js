const mongoose=require('mongoose');

const MONGO_URL='mongodb+srv://sanjaysiddhu999_db_user:ZsbSRthg9Qz4IC8l@cluster0.ix40ypj.mongodb.net/chatapp?appName=Cluster0'

const connectDB=async()=>{
    try{
        await mongoose.connect(MONGO_URL);
        console.log("connected");
    }catch (e){
        console.log('error');
    }
};

module.exports=connectDB;
