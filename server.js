// const { instrument } = require("@socket.io/admin-ui");

const io = require("socket.io")(8888, {
  cors: {
    origin: ["http://localhost:3000", "https://tic-tac-toe-online.vercel.app/"],
  },
});

const rooms = [];

io.on("connection", (socket) => {
  socket.on("turn", (board, turn, room) => {
    if (room) {
      let found = false;
      rooms.forEach((v) => {
        if (v.name === room) {
          v.users.forEach((usr) => {
            console.log(usr, socket.id);
            if (usr === socket.id) {
              found = true;
            }
          });
        }
      });
      if (found) {
        socket.to(room).emit("turn", board, turn);
      }
    }
  });
  socket.on("restart", (room) => {
    if (room) socket.to(room).emit("restart");
  });
  socket.on("join-room", (room) => {
    let found = null;
    rooms.forEach((v) => {
      if (room === v.name) {
        found = v;
      }
    });
    if (found) {
      if (found.users.length < 2) {
        found.users.push(socket.id);
        socket.join(room);
      } else {
        socket.send("full");
      }
    } else {
      rooms.push({
        name: room,
        users: [socket.id],
      });
      socket.join(room);
    }
    console.log(rooms);
  });
});

// instrument(io, { auth: false });
