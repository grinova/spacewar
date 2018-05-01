export type TimerHandler = (time: number) => void;

export class Timer {
  private handler: TimerHandler;
  private interval: number;
  private timerId: number;
  private now: number;
  private running: boolean = false;

  constructor(handler: TimerHandler, interval: number) {
    this.handler = handler;
    this.interval = interval;
  }

  run(): void {
    if (!this.timerId) {
      this.timerId = this.shot();
      this.running = true;
    }
  }

  stop(): void {
    clearTimeout(this.timerId);
    this.timerId = undefined;
    this.running = false;
  }

  private shot(): number {
    this.now = Date.now();
    return setTimeout(this.intervalHandler, this.interval);
  }

  private intervalHandler = (): void => {
    if (!this.running) {
      this.stop();
      return;
    }
    const now = Date.now();
    const time = now - this.now;
    this.now = now;
    this.handler(time);
    this.shot();
  };
}
