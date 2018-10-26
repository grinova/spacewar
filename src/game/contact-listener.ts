import {
  Body,
  Contact,
  ContactListener as BaseContactListener
  } from 'classic2d'
import { UserData } from './synchronizer'

export type OnBodyAndContactDestroy = (body: Body<UserData>, contact: Contact<UserData>) => void

export class ContactListener implements BaseContactListener<UserData> {
  private onDestroyBodyAndContact: void | OnBodyAndContactDestroy

  constructor(onBodyAndContactDestroy?: void | OnBodyAndContactDestroy) {
    this.onDestroyBodyAndContact = onBodyAndContactDestroy
  }

  beginContact(contact: Contact<UserData>): void {
    const { userData: userDataA } = contact.bodyA
    const { userData: userDataB } = contact.bodyB
    const { type: typeA } = userDataA
    const { type: typeB } = userDataB
    if (
      typeA === 'arena' && typeB === 'rocket' ||
      typeA === 'black-hole' && (typeB === 'rocket' || typeB === 'ship')
    ) {
      this.onDestroyBodyAndContact && this.onDestroyBodyAndContact(contact.bodyB, contact)
    }
    if (typeA === 'ship' && typeB === 'rocket') {
      this.onDestroyBodyAndContact && this.onDestroyBodyAndContact(contact.bodyA, contact)
      this.onDestroyBodyAndContact && this.onDestroyBodyAndContact(contact.bodyB, contact)
    }
  }

  endContact(_contact: Contact<UserData>): void {
  }

  preSolve(_contact: Contact<UserData>): void {
  }
}
