import {
  createSandbox,
  Sandbox,
  World
} from 'classic2d';
import { ContactListener } from './contact-listener';
import { InvokerSandbox } from './net/invoker';
import { Game } from '../game/game';
import { ShipControl } from '../game/ship-control';
import { UserData } from '../game/synchronizer';

class SandboxHandler {
  private world: void | World<UserData>;
  private sandbox: void | Sandbox;
  private shipControl: void | ShipControl;
  private game: void | Game;
  private invoker: void | InvokerSandbox;
  private contactListener: void | ContactListener;

  keyDown = (event: KeyboardEvent): void => {
    if (this.shipControl) {
      switch (event.key) {
        case 't':
          if (this.world && this.sandbox) {
            this.reset(this.world, this.sandbox, true)
          }
          break;
        case 'w':
          this.shipControl.setThrottle(1);
          break;
        case 's':
          this.shipControl.setThrottle(0);
          break;
      }
    }
  };

  init = (world: World<UserData>, sandbox: Sandbox) => {
    this.reset(world, sandbox, false);
  };

  preStep = (): void => {
    if (this.shipControl) {
      this.shipControl.step();
    }
  };

  reset = (world: World<UserData>, sandbox: Sandbox, stop?: boolean): void => {
    this.world = world;
    this.sandbox = sandbox;
    sandbox.zoom(12);
    if (this.contactListener) {
      this.contactListener.destroy();
    }
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
    this.contactListener = new ContactListener(this.world);
    sandbox.setContactListener(this.contactListener);
    this.invoker = new InvokerSandbox();
    this.shipControl = new ShipControl(this.world, this.invoker);
    this.game = new Game(this.world, this.invoker);
    this.game.getSession();
  };
}

window.onload = () => {
  const actions = new SandboxHandler();

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
