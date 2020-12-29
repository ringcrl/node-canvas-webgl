
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
  });
  document.body.appendChild(app.view);
  
  const bgBuffer = fs.readFileSync(path.resolve(__dirname, './assets/bg_depth_blur.jpg'))
  const bgPixels = await Jimp.read(bgBuffer)
  const bgTexture = PIXI.Texture.fromBuffer(bgPixels.bitmap.data, bgPixels.bitmap.width, bgPixels.bitmap.height)
  const bg = PIXI.Sprite.from(bgTexture);
  bg.width = app.screen.width;
  bg.height = app.screen.height;
  app.stage.addChild(bg);
  
  const littleDudesBuffer = fs.readFileSync(path.resolve(__dirname, './assets/depth_blur_dudes.jpg'))
  const littleDudesPixels = await Jimp.read(littleDudesBuffer)
  const littleDudesTexture = PIXI.Texture.fromBuffer(littleDudesPixels.bitmap.data, littleDudesPixels.bitmap.width, littleDudesPixels.bitmap.height)
  const littleDudes = PIXI.Sprite.from(littleDudesTexture);
  littleDudes.x = (app.screen.width / 2) - 315;
  littleDudes.y = 200;
  app.stage.addChild(littleDudes);
  
  const littleRobotBuffer = fs.readFileSync(path.resolve(__dirname, './assets/depth_blur_moby.jpg'))
  const littleRobotPixels = await Jimp.read(littleRobotBuffer)
  const littleRobotTexture = PIXI.Texture.fromBuffer(littleRobotPixels.bitmap.data, littleRobotPixels.bitmap.width, littleRobotPixels.bitmap.height)
  const littleRobot = PIXI.Sprite.from(littleRobotTexture);
  littleRobot.x = (app.screen.width / 2) - 200;
  littleRobot.y = 100;
  app.stage.addChild(littleRobot);
  
  const blurFilter1 = new PIXI.filters.BlurFilter();
  const blurFilter2 = new PIXI.filters.BlurFilter();
  
  littleDudes.filters = [blurFilter1];
  littleRobot.filters = [blurFilter2];
  
  let count = 0;
  
  app.ticker.add(() => {
      count += 0.005;
  
      const blurAmount = Math.cos(count);
      const blurAmount2 = Math.sin(count);
  
      blurFilter1.blur = 20 * (blurAmount);
      blurFilter2.blur = 20 * (blurAmount2);

      console.time('toBuffer')
      const canvasBuffer = app.view.toBuffer();
      console.timeEnd('toBuffer')
      fs.writeFileSync('./snapshot/pixi2.png', canvasBuffer);
  });  
}

main();
