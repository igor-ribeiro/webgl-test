import { loadImage } from './utils';

class TextureMixer {
  constructor() {
    this.canvas = null;
    this.context = null;
    this.pixels = null;
    this.texturesData = null;
  }

  async load(urls) {
    const textures = await Promise.all(urls.map(url => loadImage(url)));

    const textureWidth = textures[0].width;
    const textureHeight = textures[0].height;

    this.canvas = this._createCanvas(textureWidth, textureHeight);
    this.context = this.canvas.getContext('2d');
    this.pixels = 4 * textureWidth * textureHeight;

    this.texturesData = textures.map(texture => {
      this.context.drawImage(texture, 0, 0);

      return this.context.getImageData(0, 0, textureWidth, textureHeight).data;
    });
  }

  mix(factor) {
    const mixedData = this._mixImages(this.pixels, this.texturesData, factor);

    return this._generateImageData(mixedData, this.canvas, this.context);
  }

  _createCanvas(width, height) {
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
  }

  _mixImages(pixels, imagesData, factor) {
    const mixedData = new Uint8ClampedArray(imagesData[0]);
    let internalPixels = pixels;

    while (internalPixels--) {
      mixedData[internalPixels] = [ ...imagesData ].reverse()
        .map((data, index) => data[internalPixels] * Math.abs(index - factor))
        .reduce((acc, next) => acc + next, 0);
    }

    return mixedData;
  }

  generate(min, max, step, textureLoader) {
    const keyName = 'text-';
    const saved = window.localStorage.getItem('generated-textures');

    return Array(Math.ceil((max + step) / step))
        .fill(1)
        .map((_, index) => Number((index * step).toFixed(2)))
        .map((factor, index) => {
          const textureKey = `${keyName}${factor}`;
          let texture = window.localStorage.getItem(textureKey);

          if (!texture) {
            texture = this.mix(factor);

            // window.localStorage.setItem(textureKey, texture);
          }

          return [factor, texture];
        })
        .reduce((acc, [factor, texture]) => Object.assign({}, acc, { [factor]: textureLoader.load(texture) }), {});
  }

  _generateImageData(data) {
    const imageData = this.context.createImageData(this.canvas.width, this.canvas.height);

    imageData.data.set(data);
    this.context.putImageData(imageData, 0, 0);

    return this.canvas.toDataURL();
  }
}

export default TextureMixer;