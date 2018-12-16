import { TimeDelta, World } from 'classic2d'
import { createSandbox, Sandbox } from 'classic2d-sandbox'
import { Net } from 'physics-net'
import { singleShot } from './helpers/wrappers'
import { UserData } from '../data/user-data'
import { Client } from '../game/client'
import { IDS } from '../game/consts'

export interface Actions {
  preReset?: void | (() => void);
  postReset?: void | (() => void);
  disconnect?: void | ((id: string) => void);
}

class SandboxHandler {
  private userShipId: string;
  private netCreator: NetCreator;
  private connect: Connect
  private actions?: void | Actions;
  private world: void | World<UserData>;
  private client: void | Client;
  private net: void | Net;

  constructor(netCreator: NetCreator, connect: Connect, actions?: void | Actions) {
    this.netCreator = netCreator;
    this.connect = connect
    this.actions = actions;
  }

  keyDown = (event: KeyboardEvent): void => {
    if (!this.client) {
      return
    }
    const controller = this.client.getUserShipController()
    if (!controller) {
      return
    }
    switch (event.key) {
      case 'w':
        controller.thrust(1)
        break
      case 'a':
        controller.torque(1)
        break
      case 'd':
        controller.torque(-1)
        break
      case ' ':
        controller.fire()
        break
    }
  };

  keyUp = (event: KeyboardEvent): void => {
    if (!this.client) {
      return
    }
    const controller = this.client.getUserShipController()
    if (!controller) {
      return
    }
    switch (event.key) {
      case 'w':
        controller.thrust(0)
        break
      case 'a':
      case 'd':
        controller.torque(0)
        break
    }
  };

  init = (world: World<UserData>, sandbox: Sandbox<UserData>) => {
    this.reset(world, sandbox, false);
  };

  preStep = (time: TimeDelta): void => {
    this.client && this.client.simulate(time);
  };

  reset = (world: World<UserData>, sandbox: Sandbox<UserData>, stop?: boolean): void => {
    this.actions && this.actions.preReset && this.actions.preReset();
    this.world = world;
    sandbox.zoom(12);
    if (stop) {
      sandbox.stop();
      return;
    }
    this.actions && this.actions.disconnect && this.actions.disconnect(this.userShipId);
    this.world.clear();
    this.userShipId = IDS.SHIP_A
    this.net = this.netCreator(this.userShipId);
    if (!this.client) {
      this.client = new Client(this.net, this.world);
    }
    this.connect(this.userShipId)
    this.actions && this.actions.postReset && this.actions.postReset();
  };
}

export type NetCreator = (id: string) => Net
export type Connect = (id: string) => void

export function run(creator: NetCreator, connect: Connect, a?: void | Actions): void {
  const actions = new SandboxHandler(creator, connect, a);

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
