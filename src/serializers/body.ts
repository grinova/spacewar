import { PointData } from './point';

export type SubjectType = 'arena' | 'object';

export interface BodyData {
  id: string;
  type: SubjectType;
  linearVelocity: PointData;
  angularVelocity: number;
  position: PointData;
  angle: number;
  radius: number;
}
