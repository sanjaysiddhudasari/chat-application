const express = require("express");
const socketio = require("socket.io");
const http = require("http");

const PORT = process.env.PORT || 5000;
const router = require("./router");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");
const {addTypingUser,removeTypingUser,getTypingUsersInRoom} =require('./typingUsers');

const app = express();
const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin:  process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(router);

io.on("connection", (socket) => {
  console.log("user is connected");

  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) return callback(error);

    socket.join(user.room);

    socket.emit('typing:update',getTypingUsersInRoom(room));

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to the room ${user.room}`,
      createdAt:new Date()//here
    });

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined`,createdAt:new Date() });//here

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    if (!user) return callback?.("User not joined");

    io.to(user.room).emit("message", {
      user: user.name,
      text: message,
      createdAt:new Date()
    });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });


  socket.on('typing:start',({room,name})=>{
      addTypingUser(name,room);
      const typingUsers=getTypingUsersInRoom(room);
      io.to(room).emit('typing:update',typingUsers);
  });

  socket.on('typing:stop',({room,name})=>{
    removeTypingUser(name,room);
    const typingUsers=getTypingUsersInRoom(room);
    io.to(room).emit('typing:update',typingUsers);
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left`,
        createdAt:new Date()
      });
      removeTypingUser(user.name,user.room);
      io.to(user.room).emit('typing:update',getTypingUsersInRoom(user.room));
    }
    console.log("user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
