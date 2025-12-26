const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const connectDb = require('./db/connection')
const Message = require('./db/models/messages');


const PORT = process.env.PORT || 5000;
const router = require("./router");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");
const { addTypingUser, removeTypingUser, getTypingUsersInRoom } = require('./typingUsers');

const app = express();
const server = http.createServer(app);

const connect = async () => {
  try {
    await connectDb();
    console.log("data base connected");
  

const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(router);

io.on("connection", (socket) => {
  console.log("user is connected");

  socket.on("join", async ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) return callback(error);

    socket.join(user.room);

    socket.emit('typing:update', getTypingUsersInRoom(room));

    //load history from db(max 30 prev messages from room)
    const totalData=await Message.find({});
    console.log("totaldata: ",totalData);
    const messages = await Message.aggregate([{ $match: { room: room } }, { $sort: { createdAt: -1 } }, { $limit:30  }]);
    messages.reverse();
    
  // emit last 30 messages to the room
  for(let message of messages ){
      socket.emit('message',{
        user:message.user,
        text:message.text,
        createdAt:message.createdAt
      })
  }
  console.log(messages);


  socket.emit("message", {
    user: "admin",
    text: `${user.name}, welcome to the room ${user.room}`,
    createdAt: new Date()
  });


  socket.broadcast
    .to(user.room)
    .emit("message", { user: "admin", text: `${user.name} has joined`, createdAt: new Date() });//here

  io.to(user.room).emit("roomData", {
    room: user.room,
    users: getUsersInRoom(user.room),
  });

  callback();
});

socket.on("sendMessage", async(message, callback) => {
  const user = getUser(socket.id);
  if (!user) return callback?.("User not joined");

  //insert the message into db 
  let newMessage=await Message.insertOne({user:user.name,room:user.room,text:message,createdAt:new Date()});
  console.log(newMessage);     

  io.to(user.room).emit("message", {
    user: user.name,
    text: message,
    createdAt: new Date()
  });

  io.to(user.room).emit("roomData", {
    room: user.room,
    users: getUsersInRoom(user.room),
  });

  callback();
});


socket.on('typing:start', ({ room, name }) => {
  addTypingUser(name, room);
  const typingUsers = getTypingUsersInRoom(room);
  io.to(room).emit('typing:update', typingUsers);
});

socket.on('typing:stop', ({ room, name }) => {
  removeTypingUser(name, room);
  const typingUsers = getTypingUsersInRoom(room);
  io.to(room).emit('typing:update', typingUsers);
});

socket.on("disconnect", () => {
  const user = removeUser(socket.id);
  if (user) {
    io.to(user.room).emit("message", {
      user: "admin",
      text: `${user.name} has left`,
      createdAt: new Date()
    });
    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    removeTypingUser(user.name, user.room);
    io.to(user.room).emit('typing:update', getTypingUsersInRoom(user.room));
  }
  console.log("user disconnected");
});
});

server.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});

}
 catch (e) {
    console.log(e);
  }
}
connect();
