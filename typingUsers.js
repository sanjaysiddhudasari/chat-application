const typingUsers=[];

const addTypingUser=(name,room)=>{
    if(typingUsers.find((user)=>user.name===name&&user.room===room)) return;
    const typingUser={name,room};
    typingUsers.push(typingUser);
};

const removeTypingUser=(name,room)=>{
    const index=typingUsers.findIndex((user)=>user.name===name&&user.room===room);
    if(index!=-1)typingUsers.splice(index,1);
}

const getTypingUsersInRoom=(room)=>{
    return typingUsers.filter((user)=>user.room===room);
}

module.exports={addTypingUser,removeTypingUser,getTypingUsersInRoom};