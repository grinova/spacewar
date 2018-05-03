import { ShipControl } from '../../game/ship-control';
import { TransmitData } from '../../game/synchronizer';

export function interact(data: TransmitData, shipControl: ShipControl): void {
  const { type, action } = data;
  switch (type) {
    case 'ship-control':
      const { type, amount } = action;
      switch (type) {
        case 'throttle':
          shipControl.setThrottle(amount);
          break;
      }
      break;
  }
}
