import { run } from '../sandbox';
import { InvokerSandbox } from '../net/invoker';

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
