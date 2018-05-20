import {
  Body,
  Vec2
} from 'classic2d';
import { Controller } from './controller';
import { Timer } from '../../sandbox/timer/timer';
import { IDS } from '../consts';
import { RocketProps } from '../creators/launch-rocket';
import { TransmitData, UserData } from '../synchronizer';

export type Ship = Body<UserData>;

export interface ShipControllerHandlers {
  onSend?: void | ((data: TransmitData) => void);
  onLaunchRocket?: void | ((ship: Ship, props: RocketProps) => void);
}

export class ShipController implements Controller {
  private static readonly MAX_FORCE = 0.1;
  private static readonly MAX_TORQUE = 5;
  private static readonly DUMP_ROTATION_COEF = 0.97;
  private static readonly ROCKET_DISTANCE = 0.075;
  private static readonly ROCKET_VELOCITY = 0.2;
  private static readonly ROCKET_RADIUS = 0.01;

  private ship: Ship;
  private handlers?: void | ShipControllerHandlers;
  private throttle: number = 0;
  private torque: number = 0;

  private rocketCounter: number = 0;
  private rocketCoolDown: boolean = false;
  private rocketCoolDownTimer: Timer;

  constructor(ship: Ship, handlers?: void | ShipControllerHandlers) {
    this.ship = ship;
    this.handlers = handlers;
    this.rocketCoolDownTimer = new Timer(this.rocketCooldownHandler, 500);
  }

  fire(): void {
    if (this.rocketCoolDown) {
      return;
    }
    this.rocketCoolDown = true;
    if (this.handlers) {
      this.handlers.onLaunchRocket && this.handlers.onLaunchRocket(
        this.ship,
        {
          id: this.rocketIdGenerator(),
          distance: ShipController.ROCKET_DISTANCE,
          velocity: ShipController.ROCKET_VELOCITY,
          radius: ShipController.ROCKET_RADIUS
        }
      );
      this.handlers.onSend && this.handlers.onSend({ type: 'ship-control', action: { type: 'fire' }});
    }
    this.rocketCoolDownTimer.run();
  }

  getId(): string {
    return this.ship.userData.id;
  }

  setTorque(rotation: number): void {
    this.torque = rotation;
    this.handlers && this.handlers.onSend && this.handlers.onSend({ type: 'ship-control', action: { type: 'torque', amount: rotation }})
  }

  setThrottle(throttle: number): void {
    this.throttle = throttle;
    this.handlers && this.handlers.onSend && this.handlers.onSend({ type: 'ship-control', action: { type: 'throttle', amount: throttle }});
  }

  step(): void {
    const { ship } = this;
    const force = new Vec2(0, this.throttle);
    force.rotate(ship.getRot());
    ship.applyForce(force.mul(ShipController.MAX_FORCE));
    ship.setTorque(this.torque * ShipController.MAX_TORQUE);
    ship.angularVelocity *= ShipController.DUMP_ROTATION_COEF;
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
