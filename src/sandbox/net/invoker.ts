import { Server } from './server';
import { ObservableImpl, Observer } from '../../common/observable';
import { ReceiveData, TransmitData } from '../../game/synchronizer';
import { Invoker } from '../../net/invoker';

export class InvokerSandbox
extends ObservableImpl<ReceiveData>
implements Invoker<TransmitData, ReceiveData>, Observer<ReceiveData> {
  private server: Server;
  private id: string;

  constructor(server: Server, id: string) {
    super();
    this.server = server;
    this.id = id;
  }

  sendData(data: TransmitData): void {
    this.server.sendData(this.id, data);
  }

  notify(data: ReceiveData): void {
    this.notifyObservers(data);
  }
}
