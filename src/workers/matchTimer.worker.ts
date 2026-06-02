/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type TimerCommand =
  | { type: 'start'; seconds?: number }
  | { type: 'pause' }
  | { type: 'set'; seconds: number }
  | { type: 'add'; seconds: number }
  | { type: 'stop' };

let elapsedSeconds = 0;
let running = false;
let startedAt = 0;
let intervalId: number | undefined;
let lastPostedSecond = -1;

function currentSeconds() {
  if (!running) return elapsedSeconds;
  return elapsedSeconds + Math.floor((performance.now() - startedAt) / 1000);
}

function postTick(force = false) {
  const seconds = currentSeconds();
  if (!force && seconds === lastPostedSecond) return;

  lastPostedSecond = seconds;
  self.postMessage({ type: 'tick', seconds, running });
}

function clearTimer() {
  if (intervalId !== undefined) {
    self.clearInterval(intervalId);
    intervalId = undefined;
  }
}

function startTimer(seconds = elapsedSeconds) {
  clearTimer();
  elapsedSeconds = Math.max(0, seconds);
  startedAt = performance.now();
  running = true;
  lastPostedSecond = -1;
  intervalId = self.setInterval(() => postTick(), 250);
  postTick(true);
}

self.onmessage = (event: MessageEvent<TimerCommand>) => {
  const command = event.data;

  if (command.type === 'start') {
    startTimer(command.seconds);
    return;
  }

  if (command.type === 'pause') {
    elapsedSeconds = currentSeconds();
    running = false;
    clearTimer();
    postTick(true);
    return;
  }

  if (command.type === 'set') {
    elapsedSeconds = Math.max(0, command.seconds);
    startedAt = performance.now();
    postTick(true);
    return;
  }

  if (command.type === 'add') {
    elapsedSeconds = currentSeconds() + command.seconds;
    startedAt = performance.now();
    postTick(true);
    return;
  }

  if (command.type === 'stop') {
    elapsedSeconds = currentSeconds();
    running = false;
    clearTimer();
    postTick(true);
  }
};
