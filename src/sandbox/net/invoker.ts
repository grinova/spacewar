import { World } from 'classic2d';
import { WorldData } from 'serializers/world';
import { ObservableImpl } from '../../common/observable';
import { SyncData } from '../../game/synchronizer';
import { Invoker } from '../../net/invoker';
import { resetWorld } from '../sandbox/actors';
import { serializeWorld } from '../serializers/world';
import { Timer } from '../timer/timer';

export interface UserData {
}

export class InvokerSandbox
extends ObservableImpl<SyncData<WorldData>>
implements Invoker<UserData, SyncData<WorldData>> {
  private static STEP_TIMEOUT = 1000 / 60;
  private static SYNC_TIMEOUT = 1000 / 5;

  private world: World = new World();
  private stepTimer: Timer;
  private syncTimer: Timer;

  constructor() {
    super();
    this.stepTimer = new Timer(this.handleStep, InvokerSandbox.STEP_TIMEOUT);
    this.syncTimer = new Timer(this.handleSync, InvokerSandbox.SYNC_TIMEOUT);
    resetWorld(this.world);
    this.run();
  }

  run(): void {
    this.stepTimer.run();
    this.syncTimer.run();
  }

  sendData(data: UserData): void {
  }

  stop(): void {
    this.stepTimer.stop();
    this.syncTimer.stop();
  }

  private handleStep = (time: number): void => {
    this.world.step(time);
  };

  private handleSync = (time: number): void => {
    const worldData = serializeWorld(this.world);
    const data: SyncData<WorldData> = {
      type: 'world-data',
      data: worldData
    };
    this.notifyObservers(data);
  };
}
