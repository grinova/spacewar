import {
  Body,
  CircleShape,
  Vec2,
  World
  } from 'classic2d'
import { BodyType } from 'classic2d/dist/classic2d/physics/body'
import { Client as PhysicsClient, Net } from 'physics-net'
import { RocketActor, RocketActorProps } from '../actors/rocket-actor'
import { ShipActor, ShipActorProps } from '../actors/ship-actor'
import { RocketController } from '../controller/rocket-controller'
import { ShipController } from '../controller/ship-controller'
import { UserData } from '../data/user-data'

export class Client
extends PhysicsClient<UserData> {
  private world: World

  constructor(world: World, net: Net) {
    super(net)
    this.world = world
  }

  onConnect = () => {
    interface ShipBodyProps { position: { x: number, y: number }, angle: number }
    this.getBodiesFactory().register('ship', {
      create: ({ position, angle }: ShipBodyProps) => {
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
        body.userData = { id: '?', type: 'ship' }
        return body
      }
    })

    interface RocketBodyProps { ship: Body }
    this.getBodiesFactory().register('rocket', {
      create: ({ ship }: RocketBodyProps) => {
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
        body.userData = { id: '?', type: 'rocket' }
        return body
      }
    })
    this.getBodiesFactory().register('arena', {
      create: (_props: {}) => {
        const bodyDef = {
          position: new Vec2(0, 0),
          angle: 0,
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
      create: (_props: {}) => {
        const bodyDef = {
          position: new Vec2(0, 0),
          angle: 0,
          linearVelocity: new Vec2(0, 0),
          angularVelocity: 0
        }
        const body = this.world.createBody(bodyDef)
        const shape = new CircleShape()
        shape.radius = 0.05
        const fixtureDef = { shape, density: 1 }
        body.setFixture(fixtureDef)
        body.userData = { id: 'arena', type: 'arena' }
        body.type = BodyType.static
        return body
      }
    })

    this.getControllersFactory<UserData>().register('ship', {
      create: ({ body }) => {
        return new ShipController(body)
      }
    })
    this.getControllersFactory<UserData>().register('rocket', {
      create: ({ body }) => new RocketController(body)
    })

    this.getActorsFactory().register('ship', {
      create: (props: ShipActorProps) => new ShipActor(props)
    })
    this.getActorsFactory().register('rocket', {
      create: (props: RocketActorProps) => new RocketActor(props)
    })
  }
}

