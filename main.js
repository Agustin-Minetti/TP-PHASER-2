import Game   from "./scenes/Game.js";
import Level2 from "./scenes/Level2.js";
import Level3 from "./scenes/Level3.js";

// Create a new Phaser config object
const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 960,
      height: 640,
    },
    max: {
      width: 960,
      height: 640,
    },
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
  scene: [Level3],
};

window.game = new Phaser.Game(config);
