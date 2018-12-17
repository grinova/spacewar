import { Mat4, World } from 'classic2d'
import { CrtScreen } from 'crt-screen'
import { Camera } from 'crt-screen'
import { setCanvasSize } from './common/dom'
import { UserData } from './data/user-data'
import { Client } from './game/client'
import { UserShipController } from './game/user-ship-controller'

const PXSIZE = 3
const DEFAULT_ZOOM = 15

function calcSize(width: number, height: number): number {
  return Math.floor(width >= height ? width / PXSIZE : height / PXSIZE)
}

function roundSize(width: number, height: number): [number, number] {
  return [
    Math.floor(width / PXSIZE) * PXSIZE,
    Math.floor(height / PXSIZE) * PXSIZE,
  ]
}

export interface SpaceWarActions {
  disconnect?: () => void
}

export interface SpaceWarProps {
  actions?: SpaceWarActions
  canvas: HTMLCanvasElement
  world: World<UserData>
  client: Client
  userShipController: UserShipController
}

export class SpaceWar {
  private props: SpaceWarProps
  private camera: Camera

  private screen: CrtScreen

  private past = 0
  private running = true

  private circleModelIndex: number

  constructor(props: SpaceWarProps, w: number, h: number) {
    this.props = props

    const [width, height] = roundSize(w, h)
    setCanvasSize(this.props.canvas, width, height)
    this.camera = new Camera(0, 0, DEFAULT_ZOOM, width, height)
    this.screen = new CrtScreen(
      <WebGLRenderingContext>this.props.canvas.getContext('webgl2'),
      this.camera,
      {
        pixelizationShaderOptions: { pxsize: PXSIZE, minEdge: 1, maxEdge: 2 },
        width,
        height,
        size: calcSize(width, height)
      }
    )

    const modelShader = this.screen.getModelShader()
    {
      const color = [1,1,1,1]
      const circleSegmentsCount = 64
      const model = modelShader.createModel()
      const vertices: number[] = [0, 0]
      const colors: number[] = [...color]
      const elements: number[] = [0]
      const f = Math.PI / 2
      for (let i = 0; i <= circleSegmentsCount; i++) {
        const fi = 2 * Math.PI / circleSegmentsCount * i + f
        const x = Math.cos(fi)
        const y = Math.sin(fi)
        vertices.push(x, y)
        colors.push(...color)
        elements.push(i + 1)
      }
      model.attributes.set('aVertex', vertices)
      model.attributes.set('aColor', colors)
      model.primitives.push({ mode: this.screen.gl.LINE_STRIP, elements })
      this.circleModelIndex = model.index
    }
    modelShader.bufferData()
  }

  disconnect(): void {
    const { actions } = this.props
    actions && actions.disconnect && actions.disconnect()
  }

  keyDown(event: KeyboardEvent): boolean {
    const { userShipController: controller } = this.props
    switch (event.key) {
      case 'Escape':
        this.disconnect()
        return true
    }
    if (!controller) {
      return
    }
    switch (event.key) {
      case 'w':
        controller.thrust(1)
        return
      case 'a':
        controller.torque(1)
        return
      case 'd':
        controller.torque(-1)
        return
      case ' ':
        controller.fire()
        return
    }
  }

  keyUp(event: KeyboardEvent): boolean {
    const { userShipController: controller } = this.props
    if (!controller) {
      return
    }
    switch (event.key) {
      case 'w':
        controller.thrust(0)
        break
      case 'a':
      case 'd':
        controller.torque(0)
        break
    }
  }

  resize(width: number, height: number): void {
    const [w, h] = roundSize(width, height)
    setCanvasSize(this.props.canvas, w, h)
    this.camera.width = w
    this.camera.height = h
    this.screen.resize(w, h, calcSize(w, h))
  }

  run(): void {
    this.running = true
    requestAnimationFrame(this.render)
  }

  stop(): void {
    this.running = false
  }

  private drawScene(duration: number): void {
    this.screen.setFrameDuration(duration / 1000)
    const bodies = this.props.world.getBodies()
    for (const body of bodies) {
      const position = body.getPosition()
      const angle = body.getAngle()
      const radius = body.getFixture().getShape().getRadius()
      const matrix = new Mat4().translate(position.x, position.y).rotate(angle).scale(radius, radius, 0)
      this.screen.drawModel(this.circleModelIndex, matrix)
    }
    this.screen.flush()
  }

  private render = (now: number): void => {
    if (!this.running) {
      return
    }
    const { world, client } = this.props
    const duration = now - this.past
    client && client.simulate(duration)
    this.past = now
    world.step(duration)
    this.drawScene(duration)
    requestAnimationFrame(this.render)
  }
}
