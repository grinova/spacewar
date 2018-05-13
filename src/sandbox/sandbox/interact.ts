import { ShipController } from '../../game/controller/ship-controller';
import { TransmitData } from '../../game/synchronizer';

export function interact(data: TransmitData, shipControl: ShipController): void {
  const { type, action } = data;
  switch (type) {
    case 'ship-control':
      const { type, amount } = action;
      switch (type) {
        case 'throttle':
          shipControl.setThrottle(amount);
          break;
        case 'torque':
          shipControl.setTorque(amount);
          break;
        case 'fire':
          shipControl.fire();
          break;
      }
      break;
  }
}
