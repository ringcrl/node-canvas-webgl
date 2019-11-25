const {Canvas, Image} = require('canvas');
const createGLContext = require('gl');

function putImageData(gl, canvas) {
  const {width, height} = canvas;
  const ctx = canvas.__ctx__;

  const data = ctx.getImageData(0, 0, width, height);

  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  for(let i = 0; i < height; i++) {
    for(let j = 0; j < width; j++) {
      const col = j;
      const row = height - i - 1;
      for(let k = 0; k < 4; k++) {
        const idx = 4 * (row * width + col) + k;
        const idx2 = 4 * (i * width + col) + k;
        data.data[idx] = pixels[idx2];
      }
    }
  }

  ctx.putImageData(data, 0, 0);
}

class NewCanvas extends Canvas {
  get width() {
    return super.width;
  }

  set width(value) {
    if(this.__gl__) {
      const ext = this.__gl__.getExtension('STACKGL_resize_drawingbuffer');
      ext.resize(value, this.height);
    }
    super.width = value;
  }

  get height() {
    return super.height;
  }

  set height(value) {
    if(this.__gl__) {
      const ext = this.__gl__.getExtension('STACKGL_resize_drawingbuffer');
      ext.resize(this.width, value);
    }
    super.height = value;
  }

  getContext(type, options) {
    if(this.__contextType__ && this.__contextType__ !== type) return null;
    if(this.__gl__) return this.__gl__;
    this.__contextType__ = type;
    if(type === 'webgl' || type === 'webgl2') {
      const {width, height} = this;
      this.__ctx__ = super.getContext('2d', options);
      const ctx = createGLContext(width, height, options);
      const _tetImage2D = ctx.texImage2D;
      ctx.texImage2D = function (...args) {
        const pixels = args[args.length - 1];
        if(pixels instanceof Image) {
          const canvas = new Canvas(pixels.width, pixels.height);
          canvas.getContext('2d').drawImage(pixels, 0, 0);
          args[args.length - 1] = canvas;
        }
        return _tetImage2D.apply(this, args);
      };
      this.__gl__ = ctx;
      return this.__gl__;
    }
    return super.getContext(type, options);
  }

  toBuffer(...args) {
    const gl = this.__gl__;
    if(gl) {
      putImageData(gl, this);
    }
    return super.toBuffer(...args);
  }

  toDataURL(...args) {
    const gl = this.__gl__;
    if(gl) {
      putImageData(gl, this);
    }
    return super.toDataURL(...args);
  }

  createPNGStream(...args) {
    const gl = this.__gl__;
    if(gl) {
      putImageData(gl, this);
    }
    return super.createPNGStream(...args);
  }

  createJPEGStream(...args) {
    const gl = this.__gl__;
    if(gl) {
      putImageData(gl, this);
    }
    return super.createJPEGStream(...args);
  }

  createPDFStream(...args) {
    const gl = this.__gl__;
    if(gl) {
      putImageData(gl, this);
    }
    return super.createPDFStream(...args);
  }
}

module.exports = NewCanvas;