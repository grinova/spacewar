import { Body, BodyType } from 'classic2d';
import { UserData } from '../../game/synchronizer';
import { BodyData, BodyTypeData } from '../../serializers/body';

export function serializeBodyType(type: BodyType): BodyTypeData {
  return BodyType[type] as BodyTypeData;
}

export function serializeBody(body: Body<UserData>): BodyData {
  const {
    type, linearVelocity: lv, angularVelocity, userData
  } = body;
  const { x, y } = body.getPosition();
  const angle = body.getAngle();
  const radius = Math.abs(body.getRadius());
  return {
    userData,
    type: serializeBodyType(type),
    linearVelocity: { x: lv.x, y: lv.y },
    angularVelocity,
    position: { x, y },
    angle,
    radius
  };
}
