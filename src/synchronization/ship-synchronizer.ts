import { ControllerSynchronizer } from './controller-synchronizer';
import { ShipController } from '../game/controller/ship-controller';
import { TransmitData } from '../game/synchronizer';

export class ShipSynchronizer implements ControllerSynchronizer {
  private controller: ShipController;

  constructor(controller: ShipController) {
    this.controller = controller;
  }

  interact(data: TransmitData): void {
    const { type, action } = data;
    switch (type) {
      case 'ship-control':
        const { type, amount } = action;
        switch (type) {
          case 'throttle':
            this.controller.setThrottle(amount);
            break;
          case 'torque':
            this.controller.setTorque(amount);
            break;
          case 'fire':
            this.controller.fire();
            break;
        }
        break;
    }
  }
}
