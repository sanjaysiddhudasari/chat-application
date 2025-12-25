const connectDB=require('./connection');
const Message=require('./models/messages')

const testdb=async()=>{
    try{
        await connectDB();
        await Message.insertOne({
             user: "sanjay",
            room: "101",
            text: "test message from db",
        });
    }catch (error){
        console.log(error);
    }
}

testdb();