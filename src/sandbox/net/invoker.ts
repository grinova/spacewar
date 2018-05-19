import { World } from 'classic2d';
import { WorldData } from 'serializers/world';
import { ObservableImpl } from '../../common/observable';
import { ContactListener } from '../../game/contact-listener';
import { GameSession } from '../../game/game-session';
import {
  SyncData,
  TransmitData,
  UserData
} from '../../game/synchronizer';
import { Invoker } from '../../net/invoker';
import { interact } from '../sandbox/interact';
import { sample } from '../sandbox/reset-world.sample';
import { serializeWorld } from '../serializers/world';
import { Timer } from '../timer/timer';

class FakeInvoker
extends ObservableImpl<SyncData<WorldData>>
implements Invoker<TransmitData, SyncData<WorldData>> {
  sendData(_data: TransmitData): void {}
}

export class InvokerSandbox
extends ObservableImpl<SyncData<WorldData>>
implements Invoker<TransmitData, SyncData<WorldData>> {
  private static STEP_TIMEOUT = 1000 / 60;
  private static SYNC_TIMEOUT = 1000 / 5;

  private world: World<UserData> = new World<UserData>();
  private fakeInvoker: FakeInvoker = new FakeInvoker();
  private game: GameSession = new GameSession(this.world, this.fakeInvoker);
  private contactListener: ContactListener = new ContactListener(this.world);
  private stepTimer: Timer;
  private syncTimer: Timer;

  constructor() {
    super();
    this.world.setContactListener(this.contactListener);
    this.stepTimer = new Timer(this.handleStep, InvokerSandbox.STEP_TIMEOUT);
    this.syncTimer = new Timer(this.handleSync, InvokerSandbox.SYNC_TIMEOUT);
  }

  run(): void {
    this.game.start();
    this.fakeInvoker.notifyObservers(sample as any);
    this.stepTimer.run();
    this.syncTimer.run();
  }

  sendData(data: TransmitData): void {
    const ship = this.game.getShipController();
    ship && interact(data, ship);
  }

  stop(): void {
    this.game.destroy();
    this.stepTimer.stop();
    this.syncTimer.stop();
  }

  private handleStep = (time: number): void => {
    this.game.step();
    this.world.step(time);
  };

  private handleSync = (time: number): void => {
    const worldData = serializeWorld(this.world);
    const data: SyncData<WorldData> = {
      type: 'world-data',
      data: worldData
    };
    this.notifyObservers(JSON.parse(JSON.stringify(data)));
  };
}
