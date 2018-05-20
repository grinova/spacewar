import { IDS } from '../../game/consts';
import { Controller } from '../../game/controller/controller';
import { InvokerSandbox } from '../net/invoker';
import { Server } from '../net/server';
import { run } from '../sandbox';

window.onload = () => {
  const server = new Server();
  run(() => server.createInvoker(IDS.SHIP_A), {
    preReset: () => {
      server.stop();
    },
    postReset: () => {
      server.run();
    }
  });
};
