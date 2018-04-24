import { PointData } from './point';

export interface BodyData {
  id: string;
  type: string;
  linearVelocity: PointData;
  angularVelocity: number;
  position: PointData;
  angle: number;
}
