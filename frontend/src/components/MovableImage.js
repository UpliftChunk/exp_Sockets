import React, { useEffect, useState } from 'react';
import './styles.css';
import user1 from '../images/user1.png';
import user2 from '../images/user2.png';

function MovableImage({ userNames, setUserNames, socket, playerID, mode }) {
  const [PlayerPosition, setPlayerPosition] = useState([
    { x: 10, y: 10 },
    { x: 100, y: 100 },
  ]);
  const [target, setTarget] = useState([
    { x: 0, y: 0 },
    { x: 100, y: 100 },
  ]);
  const users = [user1, user2];

  useEffect(() => {
    // Function to move players
    const movePlayers = () => {
      setPlayerPosition((previousPositions) => {

        const newPositions = previousPositions.map((prevPosition, key) => {
          let { x, y } = prevPosition;
          const deltaX = target[key].x - x;
          const deltaY = target[key].y - y;

          const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
          const stepSize =2;

          if (distance < stepSize) {
            return { x: target[key].x, y: target[key].y }; // Player reached the target
          } else {
            return {
              x: x + (deltaX / distance) * stepSize,
              y: y + (deltaY / distance) * stepSize,
            };
          }
        });

        return newPositions;
      });
    };

    // Set up an interval to continuously move players
    const intervalId = setInterval(() => {
      movePlayers();
    }, 10); // Update every 100ms

    return () => {
      // Cleanup interval when target changes or component unmounts
      clearInterval(intervalId);
    };
  }, [target]);

  useEffect(() => {
    // Handle mouse movement
    const handleMouseMove = async (event) => {
      let new_target = { x: event.clientX, y: event.clientY };
      await socket.emit('mousemove', { playerID, new_target });
    };

    if (mode === 'play') window.addEventListener('mousemove', handleMouseMove);

    const handleNewTargets = ({ targets }) => {
      console.log(targets);
      setTarget(targets);
    };

    socket.on('NewTargets', handleNewTargets);
    socket.on('PlayerJoined', ({USERNAMES})=> {
      console.log(USERNAMES); 
      setUserNames(USERNAMES);
    })
    return () => {
      if (mode === 'play') window.removeEventListener('mousemove', handleMouseMove);
      socket.off('NewTargets', handleNewTargets); // Cleanup socket event
    };
  }, [socket, mode, playerID, setUserNames]);

  return (
    <div className="pointer-container">
      {PlayerPosition.map((position, key) => (
        <div
        key={key}
        style={{ position: 'absolute', left: position.x, top: position.y,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center' }}>
          <div
            style={{ 
              height: '20px',
              border: '2px',
              padding: '1px 4px', 
              borderRadius: '5px',
              outline: 'none',
              backgroundColor: 'rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'center'
            }} >
              <div>{(userNames?.[key])?userNames[key]:"yet to come"}</div>
          </div>
          <img
            src={users[key]}
            alt={`player_image_${key}`}
            className="dummy-mouse"
          />

        </div>
      ))}
    </div>
  );
}

export default MovableImage;
