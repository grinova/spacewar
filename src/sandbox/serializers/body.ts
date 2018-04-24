import { BodyData } from '../../serializers/body';
import { Body, BodyType } from 'classic2d';

export function serializeBody(body: Body): BodyData {
  const {
    type: t, linearVelocity: lv, angularVelocity, userData
  } = body;
  const id = userData['id'];
  const { x, y } = body.getPosition();
  const angle = body.getAngle();
  return {
    id,
    type: BodyType[t],
    linearVelocity: { x: lv.x, y: lv.y },
    angularVelocity,
    position: { x, y },
    angle
  };
}
