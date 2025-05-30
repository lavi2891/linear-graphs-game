import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../utils/socket';
import GraphViewer from './GraphViewer';

const GamePage = () => {
  const { gameId } = useParams();
  const [playerId, setPlayerId] = useState(null);
  const [role, setRole] = useState(null);
  const [m1, setM1] = useState(1);
  const [b1, setB1] = useState(0);
  const [m2, setM2] = useState(-1);
  const [b2, setB2] = useState(0);
  const [lockedIn, setLockedIn] = useState(false);

  useEffect(() => {
    socket.emit('joinGameRoom', { gameId });

    socket.on('welcome', ({ playerId, role }) => {
      setPlayerId(playerId);
      setRole(role); // backend secretly tracks but **don't show it yet**
    });

    socket.on('parameterUpdated', ({ param, value }) => {
      if (param === 'm1') setM1(value);
      if (param === 'b1') setB1(value);
      if (param === 'm2') setM2(value);
      if (param === 'b2') setB2(value);
    });

    return () => {
      socket.off('welcome');
      socket.off('parameterUpdated');
    };
  }, [gameId]);

  const handleChange = (param, value) => {
    if (!lockedIn && role) {
      // only allow real slider to send updates
      if (param === role) {
        socket.emit('updateParameter', { param, value, senderId: playerId });
      }
    }
  };

  const expressions = [
    `y=${m1}x+${b1}`,
    `y=${m2}x+${b2}`,
  ];

  const valueMap = { m1, b1, m2, b2 };

  return (
    <div>
      <h1>Game ID: {gameId}</h1>
      <h2>Player ID: {playerId}</h2>
      <h3>{lockedIn ? `You confirmed: ${role}` : 'Guess your role!'}</h3>

      <GraphViewer expressions={expressions} />

      <div>
        <h2>Blue Line: y = {m1}x + {b1}</h2>
        <h2>Red Line: y = {m2}x + {b2}</h2>
      </div>

      <div>
        {['m1', 'b1', 'm2', 'b2'].map((param) => (
          <div key={param}>
            <label>{param}</label>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.1"
              value={valueMap[param]}
              onChange={(e) => handleChange(param, parseFloat(e.target.value))}
            />
            <span>{valueMap[param]}</span>
          </div>
        ))}
      </div>

      {!lockedIn && (
        <button onClick={() => setLockedIn(true)}>
          I know my role: {role}
        </button>
      )}
    </div>
  );
};

export default GamePage;
