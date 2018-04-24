import { ObservableImpl, Observable } from '../common/observable';

export interface Invoker<T, R> extends Observable<R> {
  sendData(data: T): void;
}

export class InvokerImpl<T, R>
extends ObservableImpl<R>
implements Invoker<T, R> {
  sendData(data: T): void {
  }

  private handlerReceiveData = (data: R): void => {
    this.notifyObservers(data);
  };
}
