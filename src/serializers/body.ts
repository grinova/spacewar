import { PointData } from './point';
import { UserData } from '../game/synchronizer';

export type BodyTypeData = 'static' | 'dynamic';

export interface BodyData {
  userData: UserData;
  type: BodyTypeData;
  linearVelocity: PointData;
  angularVelocity: number;
  position: PointData;
  angle: number;
  radius: number;
}
