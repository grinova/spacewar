import { Contact, ContactFlags } from 'classic2d';
import { UserData } from '../../game/synchronizer';
import { ContactData } from '../../serializers/contact';

function serializeContactFlags(type: ContactFlags): number {
  return type;
}

export function serializeContact(contact: Contact<UserData>): ContactData {
  const { bodyA, bodyB, flags: f } = contact;
  const bodyAID = bodyA.userData.id;
  const bodyBID = bodyB.userData.id;
  const flags = serializeContactFlags(f);
  return {
    bodyAID,
    bodyBID,
    flags
  };
}
