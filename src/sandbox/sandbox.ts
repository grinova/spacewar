import { World } from 'classic2d';
import { createSandbox, Sandbox } from 'classic2d-sandbox';
import { GameSession } from '../game/game-session';
import { SyncData, UserData, SyncInvoker } from '../game/synchronizer';
import { Invoker } from '../net/invoker';
import { WorldData } from '../serializers/world';

export interface Actions<T extends SyncInvoker<WorldData>> {
  preReset?: void | ((invoker: void | T) => void);
  postReset?: void | ((invoker: T) => void);
}

class SandboxHandler<T extends SyncInvoker<WorldData>> {
  private invokerCreator: InvokerCreator<T>;
  private actions?: void | Actions<T>;
  private world: void | World<UserData>;
  private sandbox: void | Sandbox<UserData>;
  private game: void | GameSession;
  private invoker: void | T;

  constructor(invokerCreator: InvokerCreator<T>, actions?: void | Actions<T>) {
    this.invokerCreator = invokerCreator;
    this.actions = actions;
  }

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
    this.actions && this.actions.preReset && this.actions.preReset(this.invoker);
    this.world = world;
    this.sandbox = sandbox;
    sandbox.zoom(12);
    if (this.game) {
      this.game.destroy();
    }
    if (stop) {
      sandbox.stop();
      return;
    }
    this.invoker = this.invokerCreator();
    this.game = new GameSession(this.world, this.invoker, { onEnd: this.handleGameEnd });
    this.game.start();
    this.actions && this.actions.postReset && this.actions.postReset(this.invoker);
  };

  private handleGameEnd = (): void => {
    this.sandbox && this.sandbox.reset();
  };
}

export type InvokerCreator<T extends SyncInvoker<WorldData>> = () => T;

export function run<T extends SyncInvoker<WorldData>>(creator: InvokerCreator<T>, a?: void | Actions<T>): void {
  const actions = new SandboxHandler(creator, a);

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
}
