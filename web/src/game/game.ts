import Phaser from "phaser";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./config";
import { WorldScene, type WorldInit } from "./scenes/WorldScene";

export function createGame(parent: HTMLElement, init: WorldInit): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#0a1f2b",
    pixelArt: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [WorldScene],
  });
  game.scene.start("world", init);
  return game;
}
