import {
  ReceiveData,
  SyncData,
  SyncInvoker,
  TransmitData
} from './synchronizer';
import { ObservableImpl } from '../common/observable';
import { WorldData } from '../serializers/world';

export class GameInvoker
extends ObservableImpl<ReceiveData>
implements SyncInvoker {
  sendData(data: TransmitData): void {
  }

  private handlerReceiveData = (data: ReceiveData): void => {
    this.notifyObservers(data);
  };
}
