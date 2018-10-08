import { WebSocketNet } from 'physics-net'
import { run } from '../sandbox'

window.onload = () => {
  run(
    () => new WebSocketNet(new WebSocket('ws://localhost:3000/ws')),
    () => null
  );
};
