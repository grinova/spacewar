import { World } from 'classic2d';
import { createSandbox, Sandbox } from 'classic2d-sandbox';
import { keyDown, keyUp } from './helpers/keyhandlers';
import { singleShot } from './helpers/wrappers';
import { IDS } from '../game/consts';
import { GameSession } from '../game/game-session';
import { SyncInvoker, UserData } from '../game/synchronizer';

export interface Actions {
  preReset?: void | (() => void);
  postReset?: void | (() => void);
  disconnect?: void | ((id: string) => void);
}

class SandboxHandler<T extends SyncInvoker> {
  private userShipId: string;
  private invokerCreator: InvokerCreator<T>;
  private actions?: void | Actions;
  private world: void | World<UserData>;
  private sandbox: void | Sandbox<UserData>;
  private game: void | GameSession;
  private invoker: void | T;

  constructor(invokerCreator: InvokerCreator<T>, actions?: void | Actions) {
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
      case 'c':
        if (this.world) {
          this.changeShip(this.world);
        }
        break;
    }
    this.game && keyDown(event, this.game, 'w', 's', 'a', 'd', ' ');
  };

  keyUp = (event: KeyboardEvent): void => {
    this.game && keyUp(event, this.game, 'w', 'a', 'd');
  };

  init = (world: World<UserData>, sandbox: Sandbox<UserData>) => {
    this.reset(world, sandbox, false);
  };

  preStep = (): void => {
    this.game && this.game.step();
  };

  reset = (world: World<UserData>, sandbox: Sandbox<UserData>, stop?: boolean): void => {
    this.actions && this.actions.preReset && this.actions.preReset();
    this.world = world;
    this.sandbox = sandbox;
    sandbox.zoom(12);
    if (stop) {
      sandbox.stop();
      return;
    }
    if (this.game) {
      this.game.destroy();
      this.game = null;
    }
    this.changeShip(this.world);
    this.actions && this.actions.postReset && this.actions.postReset();
  };

  private changeShip(world: World<UserData>): void {
    this.actions && this.actions.disconnect && this.actions.disconnect(this.userShipId);
    world.clear();
    this.userShipId = { [IDS.SHIP_A]: IDS.SHIP_B, [IDS.SHIP_B]: IDS.SHIP_A }[this.userShipId] || IDS.SHIP_A;
    this.invoker = this.invokerCreator(this.userShipId);
    if (!this.game) {
      this.game = new GameSession(world, { onEnd: this.handleGameEnd });
    }
    this.game.close();
    this.game.connect(this.invoker, this.userShipId);
  }

  private handleGameEnd = (): void => {
    this.sandbox && this.sandbox.reset();
  };
}

export type InvokerCreator<T extends SyncInvoker> = (id: string) => T;

export function run<T extends SyncInvoker>(creator: InvokerCreator<T>, a?: void | Actions): void {
  const actions = new SandboxHandler(creator, a);

  const { sandbox } = createSandbox<UserData>({
    actions,
    width: window.innerWidth,
    height: window.innerHeight
  });
  window.addEventListener('resize', () => {
    sandbox.resize(window.innerWidth, window.innerHeight);
  });
  const { keyDown, keyUp } = singleShot(
    (event: KeyboardEvent) => sandbox.keyDown(event),
    (event: KeyboardEvent) => actions.keyUp(event),
    'w', 'a', 's', 'd', ' ', 'r', 't', 'c'
  );
  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  sandbox.run();
}
