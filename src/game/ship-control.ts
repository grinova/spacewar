import {
  Body,
  Vec2,
  World
} from 'classic2d';
import { IDS } from './consts';
import { SyncInvoker, UserData } from './synchronizer';
import { WorldData } from '../serializers/world';

type Ship = Body<UserData>;

export class ShipControl {
  private static readonly MAX_FORCE = 0.25;
  private static readonly MAX_TORQUE = 5;
  private static readonly DUMP_ROTATION_COEF = 0.97;

  private world: World<UserData>;
  private invoker: void | SyncInvoker<WorldData>;
  private throttle: number = 0;
  private torque: number = 0;

  constructor(world: World<UserData>, invoker?: void | SyncInvoker<WorldData>) {
    this.world = world;
    this.invoker = invoker;
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

  private getShip(): void | Ship {
    const bodies = this.world.getBodies();
    return bodies.find(body => body.userData.id == IDS.SHIP_A);
  }
}
