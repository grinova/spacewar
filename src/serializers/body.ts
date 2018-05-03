import { BodyType } from 'classic2d';
import { PointData } from './point';
import { ObjectType } from '../game/synchronizer';

type BodyTypeData = 'static' | 'dynamic';

export function serializeBodyType(type: BodyType): BodyTypeData {
  return BodyType[type] as BodyTypeData;
}

export interface BodyData {
  id: string;
  type: BodyTypeData;
  objectType: ObjectType;
  linearVelocity: PointData;
  angularVelocity: number;
  position: PointData;
  angle: number;
  radius: number;
}
