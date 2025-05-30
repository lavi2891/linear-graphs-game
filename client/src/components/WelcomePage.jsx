import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../utils/socket';

const WelcomePage = () => {
  const [playerName, setPlayerName] = useState('');
  const [joinGameId, setJoinGameId] = useState('');
  const navigate = useNavigate();

  const createGame = () => {
    socket.emit('createGame', { playerName }, (gameId) => {
      navigate(`/game/${gameId}`);
    });
  };

  const joinGame = () => {
    socket.emit('joinGame', { playerName, gameId: joinGameId }, (success) => {
      if (success) {
        navigate(`/game/${joinGameId}`);
      } else {
        alert('Failed to join game!');
      }
    });
  };

  return (
    <div>
      <h1>Welcome to Linear Graph Game</h1>

      <input
        type="text"
        placeholder="Your name (optional)"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />

      <div>
        <button onClick={createGame}>Create New Game</button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Game ID"
          value={joinGameId}
          onChange={(e) => setJoinGameId(e.target.value)}
        />
        <button onClick={joinGame}>Join Game</button>
      </div>
    </div>
  );
};

export default WelcomePage;
