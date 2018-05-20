import { World } from 'classic2d';
import { ObservableImpl } from '../../common/observable';
import { IDS } from '../../game/consts';
import { ContactListener } from '../../game/contact-listener';
import { ShipController } from '../../game/controller/ship-controller';
import { GameSession } from '../../game/game-session';
import {
  ReceiveData,
  TransmitData,
  UserData
} from '../../game/synchronizer';
import { Invoker } from '../../net/invoker';
import { interact } from '../sandbox/interact';
import { sample } from '../sandbox/reset-world.sample';
import { serializeWorld } from '../serializers/world';
import { Timer } from '../timer/timer';

class FakeInvoker
extends ObservableImpl<ReceiveData>
implements Invoker<TransmitData, ReceiveData> {
  sendData(_data: TransmitData): void {}
}

export class InvokerSandbox
extends ObservableImpl<ReceiveData>
implements Invoker<TransmitData, ReceiveData> {
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

  getEnemyShipController(): void | ShipController {
    return this.game.getController<ShipController>(IDS.SHIP_B);
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
    const data = {
      type: 'world-sync',
      data: worldData
    };
    this.notifyObservers(JSON.parse(JSON.stringify(data)));
  };
}
