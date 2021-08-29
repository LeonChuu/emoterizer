const Jimptest = require('jimp')
const Jimp = Jimptest.__esModule === true ? Jimptest.default : Jimptest
const { GifFrame, BitmapImage, GifUtil } = require('gifwrap')
const PseudoGif = require('../PseudoGif.js')

const rotationLimit = 360

class Rotate {
  static async transform (gif, options) {
    const rotationSpeed = options.rotationspeed || 50
    const step = -(rotationSpeed * 1.8) || -2
    const length = gif.frames.length
    const frameList = []
    for (let i = 0, frameIndex = 0; Math.abs(i) < rotationLimit; i += step, frameIndex = (frameIndex + 1) % length) {
      const image = GifUtil.copyAsJimp(Jimp, gif.frames[frameIndex])
      //    GifUtil.quantizeDekker(imageOrImages, maxColorIndexes, dither)
      image.rotate(i, false)
      const fCopied = new GifFrame(new BitmapImage(image.bitmap))
      frameList.push(fCopied)
    }
    return new PseudoGif(frameList, gif.height, gif.width)
  }
}

module.exports = { Rotate }
