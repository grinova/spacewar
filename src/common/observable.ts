export interface Observer<T> {
  notify?(data: T): void;
}

export interface Observable<T> {
  notifyObservers(data: T): void;
  register(observer: Observer<T>): boolean;
  unregister(observer: Observer<T>): boolean;
}

export class ObservableImpl<T>
implements Observable<T> {
  private observers: Set<Observer<T>> = new Set<Observer<T>>();

  notifyObservers(data: T): void {
    for (const observer of this.observers) {
      observer.notify && observer.notify(data);
    }
  }

  register(observer: Observer<T>): boolean {
    if (this.observers.has(observer)) {
      return false;
    }
    this.observers = this.observers.add(observer);
    return true;
  }

  unregister(observer: Observer<T>): boolean {
    return this.observers.delete(observer);
  }
}
