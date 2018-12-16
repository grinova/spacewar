import {
  Body,
  Contact,
  ContactListener as BaseContactListener
} from 'classic2d'
import { UserData } from '../data/user-data'

export type OnBodyAndContactDestroy = (body: Body<UserData>, contact: Contact<UserData>) => void

const shouldDestroy: { [id: string]: [boolean, boolean] } = {
  'arena|rocket': [false, true],
  'black-hole|rocket': [false, true],
  'black-hole|ship': [false, true],
  'ship|rocket': [false, true],
  'rocket|rocket': [true, true],
}

export class ContactListener implements BaseContactListener<UserData> {
  private onDestroyBodyAndContact: void | OnBodyAndContactDestroy

  constructor(onBodyAndContactDestroy?: void | OnBodyAndContactDestroy) {
    this.onDestroyBodyAndContact = onBodyAndContactDestroy
  }

  beginContact(contact: Contact<UserData>): void {
    let { bodyA, bodyB } = contact
    const { userData: userDataA } = bodyA
    const { userData: userDataB } = bodyB
    const { type: typeA } = userDataA
    const { type: typeB } = userDataB
    let pair = shouldDestroy[[typeA, typeB].join('|')]
    if (!pair) {
      [bodyB, bodyA] = [bodyA, bodyB]
      pair = shouldDestroy[[typeB, typeA].join('|')]
    }
    if (pair) {
      if (pair[0]) {
        this.onDestroyBodyAndContact && this.onDestroyBodyAndContact(bodyA, contact)
      } else if (bodyA.userData.type == 'rocket') {
        console.log('Rocket did not destroy')
      }
      if (pair[1]) {
        this.onDestroyBodyAndContact && this.onDestroyBodyAndContact(bodyB, contact)
      } else if (bodyB.userData.type == 'rocket') {
        console.log('Rocket did not destroy')
      }
    }
  }

  endContact(_contact: Contact<UserData>): void {
  }

  preSolve(_contact: Contact<UserData>): void {
  }
}
