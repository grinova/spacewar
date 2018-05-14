import { GameInvoker } from '../../game/invoker';
import { run } from '../sandbox';

window.onload = () => {
  run(() => new GameInvoker());
};
