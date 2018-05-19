import { Body, World } from 'classic2d';
import { WorldData } from 'serializers/world';
import { IDS } from './consts';
import { ContactListener } from './contact-listener';
import { Controller } from './controller/controller';
import { RocketController } from './controller/rocket-controller';
import { ShipController } from './controller/ship-controller';
import { Session } from './session';
import { synchronize } from './synchronize';
import {
  Synchronizer,
  SyncInvoker,
  UserData
} from './synchronizer';
import { ControllerData } from '../serializers/controller';

export interface GameHandlers {
  onStart?: void | ((ship: ShipController) => void);
  onEnd?: void | (() => void);
}

export class GameSession {
  private userWorld: World<UserData>;
  private invoker: SyncInvoker;
  private handlers: void | GameHandlers;

  private contactListener: ContactListener;
  private session: void | Session;
  private ship: void | ShipController;
  private controllers: Controller[] = [];

  constructor(userWorld: World<UserData>, invoker: SyncInvoker, handlers?: void | GameHandlers) {
    this.userWorld = userWorld;
    this.invoker = invoker;
    this.handlers = handlers;
    this.contactListener = new ContactListener(this.userWorld, this.handleBodyDestroy);
    this.userWorld.setContactListener(this.contactListener);
  }

  closeSession(): void {
    this.session && this.session.disconnect();
  }

  destroy(): void {
    this.contactListener.destroy();
    this.userWorld.setContactListener(null);
    this.closeSession();
  }

  getSession(): Session {
    return (this.session = this.session || this.createSession());
  }

  getShipController(): void | ShipController {
    return this.ship;
  }

  start(): Session {
    const session = this.getSession();
    session.connect();
    return session;
  }

  step(): void {
    for (const controller of this.controllers) {
      controller.step();
    }
  }

  private createSession(): Session {
    const synchronizerHandlers = {
      onSyncWorld: this.handleSyncWorld,
      onSyncController: this.handleSyncController,
      onError: this.handleError
    };
    const sessionHandlers = {
      onConnect: this.handleSessionConnect,
      onDisconnect: this.handleSessionDisconnect
    };
    const synchronizer = new Synchronizer(this.invoker, synchronizerHandlers);
    return new Session(synchronizer, sessionHandlers);
  }

  private resetShip(): void {
    this.ship = null;
    const onEnd = this.handlers && this.handlers.onEnd;
    onEnd && onEnd();
  }

  private setShip(ship: ShipController): void {
    this.ship = ship;
    const onStart = this.handlers && this.handlers.onStart;
    onStart && onStart(this.ship);
  }

  private handleSessionConnect = (): void => {
  };

  private handleSessionDisconnect = (): void => {
    this.session = null;
  };

  private handleBodyCreate = (body: Body<UserData>): void => {
    const { userData } = body;
    let controller: void | Controller;
    if (userData.type === 'ship') {
      const ship = controller = new ShipController(body, this.userWorld, this.invoker, this.handleBodyCreate);
      if (userData.id === IDS.SHIP_A) {
        this.setShip(ship);
      } else if (userData.id === IDS.SHIP_B) {
        // TODO: корабль противника
      }
    } else if (userData.type === 'rocket') {
      controller = new RocketController(body, userData.properties.owner);
    }
    controller && this.controllers.push(controller);
  };

  private handleBodyDestroy = (body: Body<UserData>): void => {
    const { userData } = body;
    const index = this.controllers.findIndex(controller => controller.getId() === body.userData.id);
    if (index !== -1) {
      this.controllers.splice(index, 1);
    }
    if (userData.type === 'ship') {
      if (userData.id === IDS.SHIP_A) {
        this.resetShip();
      } else if (userData.id === IDS.SHIP_B) {
        // TODO: корабль противника
      }
    }
  };

  private handleSyncController = (data: ControllerData): void => {
  };

  private handleSyncWorld = (data: WorldData): void => {
    const handlers = {
      onBodyCreate: this.handleBodyCreate,
      onBodyDestroy: this.handleBodyDestroy
    };
    synchronize(this.userWorld, data, handlers);
  };

  private handleError = (error: string): void => {
  };
}
