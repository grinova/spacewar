import { World } from 'classic2d';
import { InvokerSandbox } from './invoker';
import { ObservableImpl } from '../../common/observable';
import { ContactListener } from '../../game/contact-listener';
import { ShipController } from '../../game/controller/ship-controller';
import { GameSession } from '../../game/game-session';
import {
  ReceiveData,
  SyncInvoker,
  TransmitData,
  UserData
} from '../../game/synchronizer';
import { WorldData } from '../../serializers/world';
import { interact } from '../sandbox/interact';
import { sample } from '../sandbox/reset-world.sample';
import { serializeWorld } from '../serializers/world';
import { Timer } from '../timer/timer';

class FakeInvoker
extends ObservableImpl<ReceiveData>
implements SyncInvoker {
  sendData(_data: TransmitData): void {}
}

export interface DirectedReceiveData {
  id: string;
  data: ReceiveData;
}

export class Server
extends ObservableImpl<DirectedReceiveData> {
  private static STEP_TIMEOUT = 1000 / 60;
  private static SYNC_TIMEOUT = 1000 / 5;

  private world: World<UserData> = new World<UserData>();
  private fakeInvoker: FakeInvoker = new FakeInvoker();
  private game: void | GameSession;
  private stepTimer: Timer;
  private syncTimer: Timer;

  private invokers: Map<string, InvokerSandbox> = new Map<string, InvokerSandbox>();

  constructor() {
    super();
    this.stepTimer = new Timer(this.handleStep, Server.STEP_TIMEOUT);
    this.syncTimer = new Timer(this.handleSync, Server.SYNC_TIMEOUT);
  }

  clear(): void {
    this.stop();
    this.invokers = new Map<string, InvokerSandbox>();
  }

  createInvoker(id: string): SyncInvoker {
    const invoker = new InvokerSandbox(this, id);
    this.invokers.set(id, invoker);
    this.register(invoker);
    return invoker;
  }

  disconnectUser(id: string): void {
    this.unregister(this.invokers.get(id));
    this.invokers.delete(id);
  }

  sendData(id: string, data: TransmitData): void {
    const ship = this.game && this.game.getController<ShipController>(id);
    ship && interact(data, ship);
    if (data.type === 'ship-control') {
      this.notifyObservers({
        id,
        data: {
          type: 'controller-action',
          data: { id, data: JSON.parse(JSON.stringify(data)) as TransmitData }
        }
      });
    }
  }

  run(): void {
    const contactListener = new ContactListener(this.world);
    this.world.setContactListener(contactListener);
    this.game = new GameSession(this.world);
    this.game.connect(this.fakeInvoker);
    this.fakeInvoker.notifyObservers(sample as any);
    this.stepTimer.run();
    this.syncTimer.run();
  }

  stop(): void {
    this.stepTimer.stop();
    this.syncTimer.stop();
    this.invokers.forEach((_, id) => {
      this.disconnectUser(id);
    });
    this.game && this.game.destroy();
    this.world.clear();
  }

  private handleStep = (time: number): void => {
    this.game && this.game.step();
    this.world.step(time);
  };

  private handleSync = (time: number): void => {
    const worldData = serializeWorld(this.world);
    this.notifyObservers({
      id: '',
      data: {
        type: 'world-sync',
        data: JSON.parse(JSON.stringify(worldData)) as WorldData
      }
    });
  };
}
