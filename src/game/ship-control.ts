import {
  Body,
  CircleShape,
  Vec2,
  World
} from 'classic2d';
import { IDS } from './consts';
import {
  SyncInvoker,
  UserData
} from './synchronizer';
import { Timer } from '../sandbox/timer/timer';
import { WorldData } from '../serializers/world';

type Ship = Body<UserData>;

export class ShipControl {
  private static readonly MAX_FORCE = 0.1;
  private static readonly MAX_TORQUE = 5;
  private static readonly DUMP_ROTATION_COEF = 0.97;
  private static readonly ROCKET_DISTANCE = 0.075;
  private static readonly ROCKET_VELOCITY = 0.2;
  private static readonly ROCKET_RADIUS = 0.01;

  private world: World<UserData>;
  private invoker: void | SyncInvoker<WorldData>;
  private throttle: number = 0;
  private torque: number = 0;

  private rocketCounter: number = 0;
  private rocketCoolDown: boolean = false;
  private rocketCoolDownTimer: Timer;

  constructor(world: World<UserData>, invoker?: void | SyncInvoker<WorldData>) {
    this.world = world;
    this.invoker = invoker;
    this.rocketCoolDownTimer = new Timer(this.rocketCooldownHandler, 500);
  }

  fire(): void {
    if (this.rocketCoolDown) {
      return;
    }
    this.rocketCoolDown = true;
    this.createRocketBody();
    if (this.invoker) {
      this.invoker.sendData({ type: 'ship-control', action: { type: 'fire' }});
    }
    this.rocketCoolDownTimer.run();
  }

  setTorque(rotation: number): void {
    this.torque = rotation;
    if (this.invoker) {
      this.invoker.sendData({ type: 'ship-control', action: { type: 'torque', amount: rotation }})
    }
  }

  setThrottle(throttle: number): void {
    this.throttle = throttle;
    if (this.invoker) {
      this.invoker.sendData({ type: 'ship-control', action: { type: 'throttle', amount: throttle }});
    }
  }

  step(): void {
    const ship = this.getShip();
    if (!ship) {
      return;
    }
    const force = new Vec2(0, this.throttle);
    force.rotate(ship.getRot());
    ship.applyForce(force.mul(ShipControl.MAX_FORCE));
    ship.setTorque(this.torque * ShipControl.MAX_TORQUE);
    ship.angularVelocity *= ShipControl.DUMP_ROTATION_COEF;
  }

  private createRocketBody(): void {
    const ship = this.getShip();
    if (!ship) {
      return;
    }
    const position = new Vec2(0, ShipControl.ROCKET_DISTANCE);
    position.rotate(ship.getRot());
    position.add(ship.getPosition());
    const angle = ship.getAngle();
    const linearVelocity = new Vec2(0, ShipControl.ROCKET_VELOCITY);
    linearVelocity.rotate(ship.getRot());
    linearVelocity.add(ship.linearVelocity);
    const angularVelocity = 0;
    const bodyDef = { position, angle, linearVelocity, angularVelocity };
    const rocket = this.world.createBody(bodyDef);
    const id = this.rocketIdGenerator()
    rocket.userData = { id, type: 'rocket' };
    const shape = new CircleShape();
    shape.radius = ShipControl.ROCKET_RADIUS;
    const fixtureDef = { shape, density: 1 };
    rocket.setFixture(fixtureDef);
  }

  private getShip(): void | Ship {
    const bodies = this.world.getBodies();
    return bodies.find(body => body.userData.id == IDS.SHIP_A);
  }

  private rocketIdGenerator(): string {
    this.rocketCounter++;
    return IDS.ROCKET_A + '--' + this.rocketCounter.toString();
  }

  private rocketCooldownHandler = (): void => {
    this.rocketCoolDown = false;
    this.rocketCoolDownTimer.stop();
  };
}
