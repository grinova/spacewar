import {
  Body,
  CircleShape,
  Contact,
  Vec2,
  World
  } from 'classic2d'
import { BodyType } from 'classic2d/dist/classic2d/physics/body'
import { Client as PhysicsClient, Net } from 'physics-net'
import { ContactListener } from './contact-listener'
import { RocketActor, RocketActorProps } from '../actors/rocket-actor'
import { ShipActor, ShipActorProps } from '../actors/ship-actor'
import { RocketController } from '../controller/rocket-controller'
import { ShipController } from '../controller/ship-controller'

export class Client
extends PhysicsClient {
  private world: World

  constructor(world: World, net: Net) {
    super(net)
    this.world = world
    this.world.setContactListener(new ContactListener(this.destroyBodyAndContact))
  }

  onConnect = () => {
    interface BaseBodyProps { position: { x: number, y: number }, angle: number }
    interface RocketBodyProps extends BaseBodyProps { id: string }
    this.getBodiesFactory().register('ship', {
      create: ({ position, angle, id }: RocketBodyProps) => {
        const RADIUS = 0.05
        const bodyDef = {
          position: new Vec2(position.x, position.y),
          angle,
          linearVelocity: new Vec2(),
          angularVelocity: 0
        }
        const body = this.world.createBody(bodyDef)
        const shape = new CircleShape()
        shape.radius = RADIUS
        const fixtureDef = {
          shape,
          density: 1
        }
        body.setFixture(fixtureDef)
        body.userData = { id: id, type: 'ship' }
        return body
      }
    })

    interface RocketBodyProps { shipId: string }
    this.getBodiesFactory().register('rocket', {
      create: ({ shipId }: RocketBodyProps) => {
        const ship = this.getBody(shipId)
        if (!ship) {
          return
        }
        const DISTANCE = 0.075
        const VELOCITY = 0.2
        const RADIUS = 0.01
        const position = new Vec2(0, DISTANCE)
        position.rotate(ship.getRot())
        position.add(ship.getPosition())
        const angle = ship.getAngle()
        const linearVelocity = new Vec2(0, VELOCITY)
        linearVelocity.rotate(ship.getRot())
        linearVelocity.add(ship.linearVelocity)
        const angularVelocity = 0
        const bodyDef = { position, angle, linearVelocity, angularVelocity }
        const body = this.world.createBody(bodyDef)
        const shape = new CircleShape()
        shape.radius = RADIUS
        const fixtureDef = { shape, density: 1 }
        body.setFixture(fixtureDef)
        body.userData = { type: 'rocket' }
        return body
      }
    })
    this.getBodiesFactory().register('arena', {
      create: ({ position, angle }: BaseBodyProps) => {
        const bodyDef = {
          position: new Vec2(position.x, position.y),
          angle: angle,
          linearVelocity: new Vec2(0, 0),
          angularVelocity: 0,
          inverse: true
        }
        const body = this.world.createBody(bodyDef)
        const shape = new CircleShape()
        shape.radius = 1
        const fixtureDef = { shape, density: 1 }
        body.setFixture(fixtureDef)
        body.userData = { id: 'arena', type: 'arena' }
        body.type = BodyType.static
        return body
      }
    })
    this.getBodiesFactory().register('black-hole', {
      create: ({ position, angle }: BaseBodyProps) => {
        const bodyDef = {
          position: new Vec2(position.x, position.y),
          angle: angle,
          linearVelocity: new Vec2(0, 0),
          angularVelocity: 0
        }
        const body = this.world.createBody(bodyDef)
        const shape = new CircleShape()
        shape.radius = 0.05
        const fixtureDef = { shape, density: 1 }
        body.setFixture(fixtureDef)
        body.userData = { id: 'black-hole', type: 'black-hole' }
        body.type = BodyType.static
        return body
      }
    })

    this.getControllersFactory().register('ship', {
      create: ({ body }) => {
        return new ShipController(body)
      }
    })
    this.getControllersFactory().register('rocket', {
      create: ({ body }) => new RocketController(body)
    })

    this.getActorsFactory().register('ship', {
      create: (props: ShipActorProps) => new ShipActor(props)
    })
    this.getActorsFactory().register('rocket', {
      create: (props: RocketActorProps) => new RocketActor(props)
    })
  }

  private destroyBodyAndContact = (body: Body, contact: Contact): void => {
    this.world.destroyBody(body)
    const contactManager = this.world.getContactManager()
    contactManager.destroy(contact)
  }
}
