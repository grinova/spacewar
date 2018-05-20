import { World } from 'classic2d';
import { InvokerSandbox } from './invoker';
import { ObservableImpl } from '../../common/observable';
import { ContactListener } from '../../game/contact-listener';
import { ShipController } from '../../game/controller/ship-controller';
import { GameSession } from '../../game/game-session';
import {
  ReceiveData,
  TransmitData,
  UserData
} from '../../game/synchronizer';
import { SyncInvoker } from '../../game/synchronizer';
import { interact } from '../sandbox/interact';
import { sample } from '../sandbox/reset-world.sample';
import { serializeWorld } from '../serializers/world';
import { Timer } from '../timer/timer';

class FakeInvoker
extends ObservableImpl<ReceiveData>
implements SyncInvoker {
  sendData(_data: TransmitData): void {}
}

export class Server
extends ObservableImpl<ReceiveData> {
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
    this.register(invoker);
    return invoker;
  }

  sendData(subjectId: string, data: TransmitData): void {
    const ship = this.game && this.game.getController<ShipController>(subjectId);
    ship && interact(data, ship);
  }

  run(): void {
    const contactListener = new ContactListener(this.world);
    this.world.setContactListener(contactListener);
    this.game = new GameSession(this.world, this.fakeInvoker);
    this.game.start();
    this.fakeInvoker.notifyObservers(sample as any);
    this.stepTimer.run();
    this.syncTimer.run();
  }

  stop(): void {
    this.stepTimer.stop();
    this.syncTimer.stop();
    for (const id in this.invokers) {
      this.unregister(this.invokers.get(id));
    }
    this.invokers.clear();
    this.game && this.game.destroy();
  }

  private handleStep = (time: number): void => {
    this.game && this.game.step();
    this.world.step(time);
  };

  private handleSync = (time: number): void => {
    const worldData = serializeWorld(this.world);
    const data = {
      type: 'world-sync',
      data: worldData
    };
    this.notifyObservers(JSON.parse(JSON.stringify(data)));
  };
}
