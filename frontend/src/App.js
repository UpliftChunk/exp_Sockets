// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UsernameInput from './components/UsernameInput';
import DummyMousePointer from './components/MovableImage';
import socketIO from 'socket.io-client';

const ENDPOINT= `http://${process.env.REACT_APP_BACKEND_HOST_NAME}:5000`;
console.log("Backend endpoint:", ENDPOINT);
const socket= socketIO(ENDPOINT, {transports: [`websocket`]});

function App() {
  const [userNames, setUserNames] = useState('');
  const [playerID, setPlayerID] = useState('');
  const [mode, setMode] = useState('spectator');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<UsernameInput socket={socket} setUserNames={setUserNames} setPlayerID={setPlayerID} setMode={setMode}/>} />
        <Route path="/play" element={<DummyMousePointer userNames={userNames} setUserNames={setUserNames} socket={socket} playerID={playerID} mode={mode} />} />
      </Routes>
    </Router>
  );
}

export default App;
