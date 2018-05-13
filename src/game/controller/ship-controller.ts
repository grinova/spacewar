import {
  Body,
  CircleShape,
  Vec2,
  World
} from 'classic2d';
import { Controller } from './controller';
import { Timer } from '../../sandbox/timer/timer';
import { WorldData } from '../../serializers/world';
import { IDS } from '../consts';
import {
  BodyHandler,
  SyncInvoker,
  UserData
} from '../synchronizer';

type Ship = Body<UserData>;

export class ShipController implements Controller {
  private static readonly MAX_FORCE = 0.1;
  private static readonly MAX_TORQUE = 5;
  private static readonly DUMP_ROTATION_COEF = 0.97;
  private static readonly ROCKET_DISTANCE = 0.075;
  private static readonly ROCKET_VELOCITY = 0.2;
  private static readonly ROCKET_RADIUS = 0.01;

  private ship: Ship;
  private world: World<UserData>;
  private invoker: SyncInvoker<WorldData>;
  private onCreateBody?: void | BodyHandler;
  private throttle: number = 0;
  private torque: number = 0;

  private rocketCounter: number = 0;
  private rocketCoolDown: boolean = false;
  private rocketCoolDownTimer: Timer;

  constructor(ship: Ship, world: World<UserData>, invoker: SyncInvoker<WorldData>, onCreateBody?: void | BodyHandler) {
    this.ship = ship;
    this.world = world;
    this.invoker = invoker;
    this.onCreateBody = onCreateBody;
    this.rocketCoolDownTimer = new Timer(this.rocketCooldownHandler, 500);
  }

  fire(): void {
    if (this.rocketCoolDown) {
      return;
    }
    this.rocketCoolDown = true;
    const rocket = this.createRocketBody();
    this.onCreateBody && this.onCreateBody(rocket);
    this.invoker.sendData({ type: 'ship-control', action: { type: 'fire' }});
    this.rocketCoolDownTimer.run();
  }

  getId(): string {
    return this.ship.userData.id;
  }

  setTorque(rotation: number): void {
    this.torque = rotation;
    this.invoker.sendData({ type: 'ship-control', action: { type: 'torque', amount: rotation }})
  }

  setThrottle(throttle: number): void {
    this.throttle = throttle;
    this.invoker.sendData({ type: 'ship-control', action: { type: 'throttle', amount: throttle }});
  }

  step(): void {
    const { ship } = this;
    const force = new Vec2(0, this.throttle);
    force.rotate(ship.getRot());
    ship.applyForce(force.mul(ShipController.MAX_FORCE));
    ship.setTorque(this.torque * ShipController.MAX_TORQUE);
    ship.angularVelocity *= ShipController.DUMP_ROTATION_COEF;
  }

  private createRocketBody(): Body<UserData> {
    const { ship } = this;
    const position = new Vec2(0, ShipController.ROCKET_DISTANCE);
    position.rotate(ship.getRot());
    position.add(ship.getPosition());
    const angle = ship.getAngle();
    const linearVelocity = new Vec2(0, ShipController.ROCKET_VELOCITY);
    linearVelocity.rotate(ship.getRot());
    linearVelocity.add(ship.linearVelocity);
    const angularVelocity = 0;
    const bodyDef = { position, angle, linearVelocity, angularVelocity };
    const rocket = this.world.createBody(bodyDef);
    const id = this.rocketIdGenerator()
    rocket.userData = { id, type: 'rocket', properties: { owner: ship.userData.id } };
    const shape = new CircleShape();
    shape.radius = ShipController.ROCKET_RADIUS;
    const fixtureDef = { shape, density: 1 };
    rocket.setFixture(fixtureDef);
    return rocket;
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
