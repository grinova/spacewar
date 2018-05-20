import { World } from 'classic2d';
import { IDS } from '../../game/consts';
import { GameSession } from '../../game/game-session';
import { keyDown, keyUp } from '../helpers/keyhandlers';
import { Server } from '../net/server';
import { run } from '../sandbox';

window.onload = () => {
  const server = new Server();
  let game: void | GameSession;
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    game && keyDown(event, game, 'i', 'k', 'j', 'l', 'h');
  });
  window.addEventListener('keyup', (event: KeyboardEvent) => {
    game && keyUp(event, game, 'i', 'j', 'l');
  });
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
