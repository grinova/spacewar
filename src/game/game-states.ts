export enum State {
  Login,
  Waiting,
  Game,
  Final,
}

export enum Signal {
  Enter,
  PlayerLeave,
  PlayerConnErr,
  OpponentJoin,
  OpponentLeave,
  OpponentConnErr,
  Score,
  Final,
  BothPlayersReplay,
}

export const states = {
  [State.Login]: {
    [Signal.Enter]: State.Waiting,
  },
  [State.Waiting]: {
    [Signal.PlayerLeave]: State.Login,
    [Signal.PlayerConnErr]: State.Login,
    [Signal.OpponentJoin]: State.Game,
  },
  [State.Game]: {
    [Signal.Score]: State.Game,
    [Signal.PlayerLeave]: State.Login,
    [Signal.PlayerConnErr]: State.Login,
    [Signal.OpponentLeave]: State.Waiting,
    [Signal.OpponentConnErr]: State.Waiting,
    [Signal.Score]: State.Game,
    [Signal.Final]: State.Final,
  },
  [State.Final]: {
    [Signal.BothPlayersReplay]: State.Game,
    [Signal.PlayerLeave]: State.Login,
    [Signal.PlayerConnErr]: State.Login,
    [Signal.OpponentLeave]: State.Waiting,
    [Signal.OpponentConnErr]: State.Waiting,
  },
}
