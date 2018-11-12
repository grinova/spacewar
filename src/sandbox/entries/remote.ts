import { WebSocketNet } from 'physics-net'
import { run } from '../sandbox'

window.onload = () => {
  run(
    () => {
      const url = new URL(window.location.href)
      url.protocol = "ws"
      url.port = "3000"
      url.pathname = "ws"
      return new WebSocketNet(new WebSocket(url.href))
    },
    () => null
  );
};
