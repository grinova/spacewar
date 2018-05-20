import { GameSession } from '../../game/game-session';

export function keyDown(
  event: KeyboardEvent,
  game: GameSession,
  f: string,
  b: string,
  rl: string,
  rr: string,
  l: string
): void {
  const ship = game.getShipController();
  if (!ship) {
    return;
  }
  switch (event.key) {
    case f:
      ship.setThrottle(1);
      break;
    case b:
      ship.setThrottle(0);
      break;
    case rl:
      ship.setTorque(1);
      break;
    case rr:
      ship.setTorque(-1);
      break;
    case l:
      ship.fire();
      break;
  }
}

export function keyUp(
  event: KeyboardEvent,
  game: GameSession,
  f: string,
  rl: string,
  rr: string,
): void {
  const ship = game.getShipController();
  if (!ship) {
    return;
  }
  switch (event.key) {
    case f:
      ship.setThrottle(0);
      break;
    case rl:
    case rr:
      ship.setTorque(0);
      break;
  }
}
