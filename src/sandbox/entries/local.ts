import { World } from 'classic2d';
import { IDS } from '../../game/consts';
import { GameSession } from '../../game/game-session';
import { keyDown, keyUp } from '../helpers/keyhandlers';
import { singleShot } from '../helpers/wrappers';
import { Server } from '../net/server';
import { run } from '../sandbox';

window.onload = () => {
  const server = new Server();
  let game: void | GameSession;
  const { keyDown: kd, keyUp: ku } = singleShot(
    (event: KeyboardEvent) => game && keyDown(event, game, 'i', 'k', 'j', 'l', 'h'),
    (event: KeyboardEvent) => game && keyUp(event, game, 'i', 'j', 'l'),
    'i', 'k', 'j', 'l', 'h'
  )
  window.addEventListener('keydown', kd);
  window.addEventListener('keyup', ku);
  run(id => server.createInvoker(id), {
    preReset: () => {
      server.stop();
      game && game.destroy();
    },
    postReset: () => {
      game = new GameSession(new World());
      game.connect(server.createInvoker(IDS.SHIP_B), IDS.SHIP_B);
      server.run();
    },
    disconnect: id => {
      server.disconnectUser(id);
    }
  });
};
