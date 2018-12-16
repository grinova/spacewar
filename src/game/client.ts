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
import { UserShipController } from './user-ship-controller'
import { RocketActor } from '../actors/rocket-actor'
import { ShipActor } from '../actors/ship-actor'
import { RocketController } from '../controller/rocket-controller'
import { ShipController } from '../controller/ship-controller'
import { UserData } from '../data/user-data'
import { SystemHandler } from '../handlers/system-handler'

export class Client
extends PhysicsClient {
  private world: World
  private userShipController: void | UserShipController

  constructor(net: Net, world: World) {
    super(net, world)
    this.world = world
    this.world.setContactListener(new ContactListener(this.destroyBodyAndContact))
  }

  onConnect = () => {
    interface BaseBodyProps { position: { x: number, y: number }, angle: number }
    interface ShipBodyProps extends BaseBodyProps { id: string }
    this.getBodiesFactory().register('ship', {
      create: ({ position, angle, id }: ShipBodyProps) => {
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

    interface RocketBodyProps { shipId: string, id: string }
    this.getBodiesFactory().register('rocket', {
      create: ({ shipId, id }: RocketBodyProps) => {
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
        body.userData = { id, type: 'rocket' }
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

    this.getControllersFactory().register('ship', { create: () => new ShipController() })
    this.getControllersFactory().register('rocket', { create: () => new RocketController() })

    this.getActorsFactory().register('ship', { create: () => new ShipActor() })
    this.getActorsFactory().register('rocket', { create: () => new RocketActor() })

    this.getSystemRouter().register('default', new SystemHandler({
      onUserName: this.handleUserName
    }))
  }

  getUserShipController(): void | UserShipController {
    return this.userShipController
  }

  private handleUserName = (userName: string): void => {
    this.userShipController = new UserShipController(userName, this.getEventSender())
  }

  private destroyBodyAndContact = (body: Body<UserData>, contact: Contact): void => {
    if (body.userData) {
      const { id, type } = body.userData
      if (type != 'ship') {
        this.destroy(id)
        const contactManager = this.world.getContactManager()
        contactManager.destroy(contact)
      }
    }
  }
}
