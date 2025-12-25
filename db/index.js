const connectDB=require('./connection');
const Message=require('./models/messages')


const main=async()=>{
    try{
        await connectDB();
    }
    catch(e){
        console.log(e);
    }
}

main();