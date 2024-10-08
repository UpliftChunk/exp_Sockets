const express = require('express'); 
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();

// Use CORS and allow requests from your frontend origin
// const corsOptions = {
//   origin: 'http://localhost:3000', // Adjust this to match your frontend URL
// };

app.use(cors());
app.get('/', (req, res)=> {res.send("hi browser")});


const server = http.createServer(app);
const io = socketIo(server);

const users= {};
const targets= [{ x: 0, y: 0 }, { x: 100, y: 100}];
let availablePlayerId= 0;
// Your socket setup
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('joined', ({user}) => {
    let payload = {user, mode: "spectator"};
    let playerID;
    if(Object.keys(users).length < 2){
      playerID= availablePlayerId++;
      payload["mode"] = "play";
    }
    payload["playerID"] = playerID;
    users[socket.id]= payload;

    let userNames = Object.values(users).map((user) => user.user);
    payload["userNames"]= userNames; 
    console.log('User:', payload);
    
    socket.emit('welcome', payload);
    if(payload.mode==="play") io.emit('PlayerJoined', {USERNAMES: userNames});
  });

  socket.on('mousemove', ({playerID, new_target})=>{
    targets[playerID] = new_target;
    io.emit('NewTargets', {targets});
  });

  socket.on('disconnect', () => {
    let id= socket.id;
    if(users[id]?.mode==="play") availablePlayerId= users[id].playerID;
    console.log('User:', users[id]?.user, 'disconnected:', socket.id);
    delete(users[id]);
  });
});

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
