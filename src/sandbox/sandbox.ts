import { World } from 'classic2d';
import { createSandbox, Sandbox } from 'classic2d-sandbox';
import { InvokerSandbox } from './net/invoker';
import { Game } from '../game/game';
import { UserData } from '../game/synchronizer';

class SandboxHandler {
  private world: void | World<UserData>;
  private sandbox: void | Sandbox<UserData>;
  private game: void | Game;
  private invoker: void | InvokerSandbox;

  keyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 't':
        if (this.world && this.sandbox) {
          this.reset(this.world, this.sandbox, true)
        }
        break;
    }
    const ship = this.game && this.game.getShipController();
    if (!ship) {
      return;
    }
    switch (event.key) {
      case 'w':
        ship.setThrottle(1);
        break;
      case 's':
        ship.setThrottle(0);
        break;
      case 'a':
        ship.setTorque(1);
        break;
      case 'd':
        ship.setTorque(-1);
        break;
      case ' ':
        ship.fire();
        break;
    }
  };

  keyUp = (event: KeyboardEvent): void => {
    const ship = this.game && this.game.getShipController();
    if (!ship) {
      return;
    }
    switch (event.key) {
      case 'w':
        ship.setThrottle(0);
        break;
      case 'a':
      case 'd':
        ship.setTorque(0);
        break;
    }
  };

  init = (world: World<UserData>, sandbox: Sandbox<UserData>) => {
    this.reset(world, sandbox, false);
  };

  preStep = (): void => {
    this.game && this.game.step();
  };

  reset = (world: World<UserData>, sandbox: Sandbox<UserData>, stop?: boolean): void => {
    this.world = world;
    this.sandbox = sandbox;
    sandbox.zoom(12);
    if (this.invoker) {
      this.invoker.stop();
    }
    if (this.game) {
      this.game.destroy();
    }
    if (stop) {
      sandbox.stop();
      return;
    }
    this.invoker = new InvokerSandbox();
    this.game = new Game(this.world, this.invoker, { onEnd: this.handleGameEnd });
    this.game.start();
    this.invoker.run();
  };

  private handleGameEnd = (): void => {
    this.sandbox && this.sandbox.reset();
  };
}

window.onload = () => {
  const actions = new SandboxHandler();

  const { sandbox } = createSandbox<UserData>({
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
  window.addEventListener('keyup', (event: KeyboardEvent) => {
    actions.keyUp(event);
  });
  sandbox.run();
};
