import throttle from 'lodash.throttle';
import socket from '../utils/socket';

const emitUpdate = throttle((param, value, playerId) => {
  socket.emit('updateParameter', { param, value, senderId: playerId });
}, 100); // limit to every 100ms

const ControlPanel = ({ param, value, playerId }) => {
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    emitUpdate(param, newValue, playerId);
  };

  return (
    <div>
      <label>{param}</label>
      <input
        type="range"
        min="-10"
        max="10"
        step="0.1"
        value={value}
        onChange={handleChange}
      />
      <span>{value}</span>
    </div>
  );
};

export default ControlPanel;
