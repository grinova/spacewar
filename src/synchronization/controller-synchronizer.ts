import { TransmitData } from '../game/synchronizer';

export interface ControllerSynchronizer {
  interact(data: TransmitData): void;
}
