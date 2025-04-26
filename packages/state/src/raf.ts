/* eslint-disable @typescript-eslint/no-explicit-any */

interface Eachable<T> {
  forEach(cb: (value: T) => void): void;
}

function eachSafely<T>(values: Eachable<T>, each: (value: T) => void) {
  values.forEach((value) => {
    try {
      each(value);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e as Error);
    }
  });
}

/** The number of pending tasks  */
let pendingCount = 0;

interface Queue<T extends (...args: any[]) => any = (...args: any[]) => any> {
  add: (fn: T) => void;
  delete: (fn: T) => boolean;
  flush: (arg?: any) => void;
}

function makeQueue<T extends (...args: any[]) => any>(): Queue<T> {
  let next = new Set<T>();
  let current = next;
  return {
    add(fn) {
      pendingCount += current == next && !next.has(fn) ? 1 : 0;
      next.add(fn);
    },
    delete(fn) {
      pendingCount -= current == next && next.has(fn) ? 1 : 0;
      return next.delete(fn);
    },
    flush(arg) {
      if (current.size) {
        next = new Set();
        pendingCount -= current.size;
        eachSafely(current, (fn) => fn(arg) && next.add(fn));
        pendingCount += next.size;
        current = next;
      }
    },
  };
}

type FrameUpdateFn = (dt: number) => boolean | void;

const updateQueue = makeQueue<FrameUpdateFn>();

const nativeRaf =
  typeof window != "undefined" ? window.requestAnimationFrame : () => {};

/**
 * Schedule an update for next frame.
 * Your function can return `true` to repeat next frame.
 */
export const raf = (fn: FrameUpdateFn) => schedule(fn, updateQueue);

raf.now =
  typeof performance != "undefined" ? () => performance.now() : Date.now;
raf.batchedUpdates = (fn: () => void) => fn();

/** The most recent timestamp. */
let ts = -1;

function schedule<T extends (...args: any[]) => any>(fn: T, queue: Queue<T>) {
  queue.add(fn);
  start();
}

function start() {
  if (ts < 0) {
    ts = 0;
    nativeRaf(loop);
  }
}

function stop() {
  ts = -1;
}

function loop() {
  if (~ts) {
    nativeRaf(loop);
    raf.batchedUpdates(update);
  }
}

function update() {
  const prevTs = ts;
  ts = raf.now();

  if (!pendingCount) {
    stop();

    return;
  }

  updateQueue.flush(prevTs ? Math.min(64, ts - prevTs) : 16.667);
}
