
const fs = require('fs');
const path = require('path');
require('jsdom-global')();
const {mockDOM} = require('../lib');
mockDOM(window, {mockImage: true});
const Jimp = require('jimp');
const PIXI = require('pixi.js');

const screenWidth = 800;
const screenHeight = 600;

async function main() {
  const app = new PIXI.Application({
    width: screenWidth,
    height: screenHeight,
    backgroundColor: 0x1099bb,
    resolution: window.devicePixelRatio || 1,
    preserveDrawingBuffer: true,
  });
  document.body.appendChild(app.view);

  const container = new PIXI.Container();

  app.stage.addChild(container);

  // Create a new texture
  const textureBuffer = fs.readFileSync(path.resolve(__dirname, './assets/bunny.png'));
  const jimp = await Jimp.read(textureBuffer);
  const texture = PIXI.Texture.fromBuffer(jimp.bitmap.data, jimp.bitmap.width, jimp.bitmap.height);
  // const texture = PIXI.Texture.from('https://cdn-1257430323.cos.ap-guangzhou.myqcloud.com/assets/imgs/20201228180912_671dfaa933552f588d943ca39375807e.png');

  // Create a 5x5 grid of bunnies
  for(let i = 0; i < 25; i++) {
    const bunny = new PIXI.Sprite(texture);
    bunny.anchor.set(0.5);
    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    container.addChild(bunny);
  }

  // Move container to the center
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  // Center bunny sprite in local container coordinates
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;


  // Listen for animate update
  app.ticker.add((delta) => {
    // rotate the container!
    // use delta to create frame-independent transform
    container.rotation -= 0.01 * delta;
    console.time('toBuffer')
    const canvasBuffer = app.view.toBuffer();
    console.timeEnd('toBuffer')
    fs.writeFileSync('./snapshot/pixi.png', canvasBuffer);
  });
}

main();
