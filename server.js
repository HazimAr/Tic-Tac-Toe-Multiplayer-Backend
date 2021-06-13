const io = require("socket.io")(process.env.PORT || 8888, {
  cors: {
    origin: ["http://localhost:3000", "https://tic-tac-toe-online.vercel.app"],
  },
});

const rooms = [];

io.on("connection", (socket) => {
  // socket.disconnect();
  // return;
  let started = false;
  let currentRoom = "";
  // let currentRooms = [];

  socket.on("hover", (hover, room) => {
    socket.to(room).emit("hover", hover);
  });

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

      if (found) socket.to(room).except(socket.id).emit("turn", board, turn);
    }
  });

  socket.on("join-room", (room, callback) => {
    let found = null;
    rooms.forEach((r) => {
      if (r.name === room) {
        found = r;
      }
    });
    if (found) {
      found.users.forEach((user) => {
        if (user.id == socket.id) return;
      });
      if (found.users.length < 2) {
        found.users.push({ id: socket.id, val: 1 });
        socket.join(room);
        // currentRooms.push(room);
        currentRoom = room;
        started = true;
        callback(started, 1);
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
            val: 0,
          },
        ],
      });
      socket.join(room);
      // currentRooms.push(room);
      currentRoom = room;

      callback(started, 0);
    }
    console.log(rooms);
  });

  socket.on("restart", (room) => {
    socket.to(room).emit("restart");
  });

  // socket.on("disconnect", () => {
  //   currentRooms.forEach((room) => {
  //     console.log(room);
  //     socket.leave(room);
  //     room.users.forEach((user) => {
  //       if (user.id == socket.id) {
  //         rooms.filter((room, index) => {
  //           rooms.splice(index, 1);
  //         });
  //       }
  //     });
  //   });
  //   // probably gonna cause bugs :(
  //   //
  //   //  let found = null;
  //   //  rooms.forEach((r) => {
  //   //    if (r.name === room) {
  //   //      found = r;
  //   //    }
  //   //  });
  //   // found.users.forEach((user) => {
  //   //   if (user.id == socket.id) return;
  //   // });
  // });
  socket.on("disconnect", () => {
    delete rooms[currentRoom];
    socket.to(currentRoom).emit("end");
  });
});
