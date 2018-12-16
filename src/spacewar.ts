import { Mat4, World } from 'classic2d'
import { CrtScreen } from 'crt-screen'
import { Camera } from 'crt-screen'
import { WebSocketNet } from 'physics-net'
import { setCanvasSize } from './common/dom'
import { UserData } from './data/user-data'
import { Client } from './game/client'

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

export interface SpaceWarOptions {
  actions?: SpaceWarActions
  canvas: HTMLCanvasElement
  ws: WebSocket
  width: number
  height: number
}

export class SpaceWar {
  private actions?: SpaceWarActions
  private canvas: HTMLCanvasElement
  private ws: WebSocket

  private world: World<UserData>
  private client: Client
  private net: WebSocketNet
  private camera: Camera
  private screen: CrtScreen

  private past = 0
  private running = true

  private circleModelIndex: number

  constructor(options: SpaceWarOptions) {
    const { actions, canvas, width: w, height: h, ws } = options
    this.actions = actions
    this.canvas = canvas
    this.ws = ws

    const [width, height] = roundSize(w, h)
    setCanvasSize(canvas, width, height)
    this.camera = new Camera(0, 0, DEFAULT_ZOOM, width, height)
    this.screen = new CrtScreen(
      <WebGLRenderingContext>canvas.getContext('webgl2'),
      this.camera,
      {
        pixelizationShaderOptions: { pxsize: PXSIZE, minEdge: 1, maxEdge: 2 },
        width,
        height,
        size: calcSize(width, height)
      }
    )

    this.world = new World<UserData>()
    this.net = new WebSocketNet(ws)
    this.client = new Client(this.net, this.world)

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
    this.ws.close()
    this.actions && this.actions.disconnect && this.actions.disconnect()
  }

  keyDown(event: KeyboardEvent): boolean {
    const controller = this.client.getUserShipController()
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
    const controller = this.client.getUserShipController()
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
    setCanvasSize(this.canvas, w, h)
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
    const bodies = this.world.getBodies()
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
    const duration = now - this.past
    this.client && this.client.simulate(duration)
    this.past = now
    this.world.step(duration)
    this.drawScene(duration)
    requestAnimationFrame(this.render)
  }
}
