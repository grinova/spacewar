export type State = number
export type Signal = number

export interface StateMachineTable {
  [state: number]: {
    [signal: number]: number
  }
}

export interface StateCallbacks {
  enter?(): void
  leave?(): void
}

export interface StatesCallbacks {
  [state: number]: StateCallbacks
}

export class StateMachine {
  private readonly states: StateMachineTable
  private readonly callbacks: StatesCallbacks
  private state: State

  constructor(states: StateMachineTable, callbacks: StatesCallbacks, state?: State) {
    this.states = states
    this.callbacks = callbacks
    this.set(state)
  }

  sig(signal: Signal): void {
    this.set(this.states[this.state][signal])
  }

  private set(state: State): void {
    if (state == null || this.state == state) {
      return
    }
    this.leave(this.state)
    this.state = state
    this.enter(this.state)
  }

  private enter(state: State): void {
    const nextStateCallbacks = this.callbacks[state]
    nextStateCallbacks && nextStateCallbacks.enter()
  }

  private leave(state: State): void {
    const prevStateCallbacks = this.callbacks[state]
    prevStateCallbacks && prevStateCallbacks.leave()
  }
}
