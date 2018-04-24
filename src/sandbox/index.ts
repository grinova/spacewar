import { createSandbox, World } from 'classic2d';
import { InvokerSandbox } from './net/invoker';
import { Game } from '../game/game';

class SandboxActions {
  private world: void | World;
  private game: void | Game;
  private invoker: void | InvokerSandbox;

  init = (world: World) => {
    this.reset(world);
  };

  reset = (world: World): void => {
    this.world = world;
    if (this.invoker) {
      this.invoker.stop();
    }
    if (this.game) {
      this.game.closeSession();
    }
    this.invoker = new InvokerSandbox();
    this.game = new Game(this.world, this.invoker);
    this.game.getSession();
  };
}

window.onload = () => {
  const actions = new SandboxActions();
  const { sandbox } = createSandbox({
    actions,
    width: window.innerWidth,
    height: window.innerHeight
  });
  window.addEventListener('resize', () => {
    sandbox.resize(window.innerWidth, window.innerHeight);
  });
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    sandbox.keyDown(event);
  });
  sandbox.run();
};
