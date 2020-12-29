
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

  const geometry = new PIXI.Geometry()
    .addAttribute('aVertexPosition', // the attribute name
      [-100, -100, // x, y
        100, -100, // x, y
        100, 100,
        -100, 100], // x, y
      2) // the size of the attribute
    .addAttribute('aUvs', // the attribute name
      [0, 0, // u, v
        1, 0, // u, v
        1, 1,
        0, 1], // u, v
      2) // the size of the attribute
    .addIndex([0, 1, 2, 0, 2, 3]);

  const vertexSrc = `
  
      precision mediump float;
  
      attribute vec2 aVertexPosition;
      attribute vec2 aUvs;
  
      uniform mat3 translationMatrix;
      uniform mat3 projectionMatrix;
  
      varying vec2 vUvs;
  
      void main() {
  
          vUvs = aUvs;
          gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
  
      }`;

  const fragmentSrc = `
  
      precision mediump float;
  
      varying vec2 vUvs;
  
      uniform sampler2D uSampler2;
      uniform float time;
  
      void main() {
  
          gl_FragColor = texture2D(uSampler2, vUvs + sin( (time + (vUvs.x) * 14.) ) * 0.1 );
      }`;

  const textureBuffer = fs.readFileSync(path.resolve(__dirname, './assets/bg_scene_rotate.jpg'));
  const jimp = await Jimp.read(textureBuffer);
  const texture = PIXI.Texture.fromBuffer(jimp.bitmap.data, jimp.bitmap.width, jimp.bitmap.height);

  const uniforms = {
    uSampler2: texture,
    time: 0,
  };

  const shader = PIXI.Shader.from(vertexSrc, fragmentSrc, uniforms);

  const quad = new PIXI.Mesh(geometry, shader);

  quad.position.set(400, 300);
  quad.scale.set(2);

  app.stage.addChild(quad);

  // start the animation..
  // requestAnimationFrame(animate);

  app.ticker.add((delta) => {
    quad.rotation += 0.01;
    quad.shader.uniforms.time += 0.1;

    console.time('toBuffer');
    const canvasBuffer = app.view.toBuffer();
    console.timeEnd('toBuffer');
    fs.writeFileSync('./snapshot/pix3.png', canvasBuffer);
  });
}

main();
