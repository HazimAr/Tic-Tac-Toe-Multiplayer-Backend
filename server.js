const io = require("socket.io")(process.env.PORT || 8888, {
  cors: {
    origin: ["http://localhost:3000", "https://tic-tac-toe-online.vercel.app"],
  },
});

const rooms = [];

io.on("connection", (socket) => {
  let currentRoom = "";

  socket.on("turn", (board, turn, room) => {
    if (room) {
      let found = false;
      rooms.forEach((v) => {
        if (v.name === room) {
          v.users.forEach((usr) => {
            if (usr.id === socket.id) {
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
        found.users.push({
          id: socket.id,
          val: false,
        });
        socket.join(room);
        currentRoom = room;
        socket.emit("data", false);
        socket.to(room).emit("start");
      } else {
        socket.send("full");
      }
    } else {
      rooms.push({
        name: room,
        users: [
          {
            id: socket.id,
            val: true,
          },
        ],
      });
      socket.join(room);
      currentRoom = room;
      socket.emit("data", true);
    }
    console.log(rooms);
  });

  socket.on("disconnect", () => {
    delete rooms[currentRoom]
    socket.to(currentRoom).emit("end");
  });
});
