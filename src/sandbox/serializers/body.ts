import { BodyData } from '../../serializers/body';
import { Body, BodyType } from 'classic2d';

export const DEFAULT_ARENA_ID = 'arena';

export function serializeBody(body: Body): BodyData {
  const {
    type: t, linearVelocity: lv, angularVelocity, userData
  } = body;
  const id = userData['id'];
  const { x, y } = body.getPosition();
  const angle = body.getAngle();
  const radius = Math.abs(body.getRadius());
  const type = id == DEFAULT_ARENA_ID ? 'arena' : 'object';
  return {
    id,
    type,
    linearVelocity: { x: lv.x, y: lv.y },
    angularVelocity,
    position: { x, y },
    angle,
    radius
  };
}
