const flags: Map<string, boolean> = new Map<string, boolean>();

export type KeyboardHandler = (event: KeyboardEvent) => void;

export function singleShot(
  keyDown: KeyboardHandler,
  keyUp: KeyboardHandler,
  ...keys: string[]
): { keyDown: KeyboardHandler, keyUp: KeyboardHandler } {
  return {
    keyDown: function(event: KeyboardEvent) {
      const { key } = event;
      if (keys.indexOf(key) === -1) {
        return;
      }
      if (!flags.get(key)) {
        flags.set(key, true);
        keyDown(event);
      }
    },
    keyUp: function(event: KeyboardEvent) {
      const { key } = event;
      if (keys.indexOf(key) === -1) {
        return;
      }
      if (flags.get(key)) {
        flags.set(key, false);
        keyUp(event);
      }
    }
  };
}
