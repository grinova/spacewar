import {
  EventMessage,
  Message,
  Net
  } from 'physics-net'

export class SandboxNet
implements Net {
  onConnect?(): void
  onDisconnect?(): void
  onMessage?(message: Message): void

  send(data: EventMessage): void {
    console.log(data)
  }
}
