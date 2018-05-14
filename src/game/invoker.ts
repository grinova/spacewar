import {
  SyncData,
  SyncInvoker,
  TransmitData
} from './synchronizer';
import { ObservableImpl } from '../common/observable';
import { WorldData } from '../serializers/world';

export class GameInvoker
extends ObservableImpl<SyncData<WorldData>>
implements SyncInvoker<WorldData> {
  sendData(data: TransmitData): void {
  }

  private handlerReceiveData = (data: SyncData<WorldData>): void => {
    this.notifyObservers(data);
  };
}
