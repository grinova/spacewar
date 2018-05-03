import {
  createSandbox,
  Sandbox,
  World
} from 'classic2d';
import { ContactListener } from './contact-listener';
import { InvokerSandbox } from './net/invoker';
import { Game } from '../game/game';
import { UserData } from '../game/synchronizer';

class SandboxActions {
  private world: void | World<UserData>;
  private game: void | Game;
  private invoker: void | InvokerSandbox;
  private contactListener: void | ContactListener;

  init = (world: World<UserData>, sandbox: Sandbox) => {
    this.reset(world, sandbox, false);
  };

  reset = (world: World<UserData>, sandbox: Sandbox, stop: boolean = true): void => {
    this.world = world;
    sandbox.zoom(12);
    if (this.contactListener) {
      this.contactListener.destroy();
    }
    this.contactListener = new ContactListener(this.world);
    sandbox.setContactListener(this.contactListener);
    if (this.invoker) {
      this.invoker.stop();
    }
    if (this.game) {
      this.game.closeSession();
    }
    if (stop) {
      sandbox.stop();
      return;
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
