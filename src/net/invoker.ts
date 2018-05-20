import { Observable } from '../common/observable';

export interface Invoker<T, R> extends Observable<R> {
  sendData(data: T): void;
}
