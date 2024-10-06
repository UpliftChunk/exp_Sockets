import React, { useEffect, useRef, useState } from 'react';
import './styles.css';
import user1 from '../images/user1.png';
import user2 from '../images/user2.png';

function DummyMousePointer({ userName, socket, playerID, mode }) {
  const [PlayerPosition, setPlayerPosition] = useState([{ x: 0, y: 0 }, { x: 100, y: 100 }]);
  const [target, setTarget] = useState([{ x: 0, y: 0 }, { x: 100, y: 100 }]);
  const [reached, setReached] = useState(0);
  const animationRef = useRef(null); // To store the animation frame ID
  const users = [user1, user2];

  // Animation loop using requestAnimationFrame
  const movePlayers = () => {
    setPlayerPosition((previousPositions) => {
      let allReached = true;

      const newPositions = previousPositions.map((prevPosition, key) => {
        let { x, y } = prevPosition;
        const deltaX = target[key].x - x;
        const deltaY = target[key].y - y;

        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        const stepSize = 10;

        if (distance < stepSize) {
          return { x: target[key].x, y: target[key].y }; // Player reached the target
        } else {
          allReached = false;
          return {
            x: x + (deltaX / distance) * stepSize,
            y: y + (deltaY / distance) * stepSize,
          };
        }
      });

      if (allReached) {
        cancelAnimationFrame(animationRef.current); // Stop the animation when all players have reached their target
        setReached(3); // Update to indicate all players have reached
      }

      return newPositions;
    });

    animationRef.current = requestAnimationFrame(movePlayers);
  };

  // Effect for starting the animation when targets are updated
  useEffect(() => {
    if (reached !== 3) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(movePlayers);
    }
  }, [target]);

  // Effect for setting up the socket and mouse move events
  useEffect(() => {
    // Handle mouse movement
    const handleMouseMove = async (event) => {
      let new_target = { x: event.clientX, y: event.clientY };
      await socket.emit('mousemove', { playerID, new_target });
    };

    if (mode === "play") {
      window.addEventListener('mousemove', handleMouseMove);
    }

    const handleNewTargets = ({ targets }) => {
      setTarget(targets);
      setReached(0); // Reset reached state on new targets
    };

    socket.on('NewTargets', handleNewTargets);

    return () => {
      if (mode === "play") {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      socket.off('NewTargets', handleNewTargets); // Cleanup socket event
      cancelAnimationFrame(animationRef.current); // Stop any ongoing animation
    };
  }, [socket, mode, playerID]);

  return (
    <div className="pointer-container">
      {PlayerPosition.map((position, key) => (
        <img
          key={key}
          src={users[key]}
          alt={`player_image_${key}`}
          style={{ position: 'absolute', left: position.x, top: position.y }}
          className="dummy-mouse"
        />
      ))}
    </div>
  );
}

export default DummyMousePointer;
