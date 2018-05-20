import {
  ReceiveData,
  SyncInvoker,
  TransmitData
} from './synchronizer';
import { ObservableImpl } from '../common/observable';

export class GameInvoker
extends ObservableImpl<ReceiveData>
implements SyncInvoker {
  sendData(_data: TransmitData): void {
  }
}
