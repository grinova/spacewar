import { Controller } from '../../game/controller/controller';
import { InvokerSandbox } from '../net/invoker';
import { run } from '../sandbox';

window.onload = () => {
  run(() => new InvokerSandbox(), {
    preReset: invoker => {
      invoker && invoker.stop();
    },
    postReset: invoker => {
      invoker.run();
    }
  });
};
