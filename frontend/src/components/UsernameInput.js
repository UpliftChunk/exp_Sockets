// src/components/UsernameInput.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import user1 from '../images/user1.png';
import user2 from '../images/user2.png';

function UsernameInput({ socket, setUserNames, setPlayerID, setMode }) {
  const [user, setUser] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async(e) => {
    e.preventDefault();
    if (user) {
      await socket.emit('joined', {user}); // Emit the username
    }
    else return;

    await socket.on('welcome',({userNames, playerID, mode})=>{
      setUserNames(userNames);
      setPlayerID(playerID);
      setMode(mode);
      navigate(`/play`);
    })
  };
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Set the animation state to true after a short delay to trigger the transition
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(()=>{
   socket.on('connect', ()=>{
      console.log(`connecion made from ${socket.id}`);

      socket.on('leave', (data)=>{
         console.log(data.user+": "+data.message);
      })

      return ()=>{
         socket.emit('disconnect');
         socket.off();
      }
   }, []);

 });
  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '10rem'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem', // Space between the two images
          position: 'relative',
        }}
      >
        <img
          src={user1}
          alt="user1"
          style={{
            maxHeight: '120px',
            transform: animate ? 'translateX(95%) scale(1)' : 'translateX(-100%) scale(2)',
            transition: 'transform 1s ease-in-out',
          }}
        />
        <img
          src={user2}
          alt="user2"
          style={{
            maxHeight: '120px',
            transform: animate ? 'translateX(-95%) scale(1)' : 'translateX(100%) scale(2)',
            transition: 'transform 1s ease-in-out',
          }}
        />
      </div>
      <div style={{ marginTop: '-1rem', zIndex: '1' }}>
        <input
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Enter your username"
          required
          style={{ marginBottom: '0.5rem', padding: '5px 10px', fontSize: '1.1rem', border: '1px solid' }}
        />
      </div>
      <button type="submit" style={{padding: '5px 10px', fontSize: '1.1rem'}}>Start Game</button>
    </form>
  );
}

export default UsernameInput;
