const Jimptest = require('jimp')
const Jimp = Jimptest.__esModule === true ? Jimptest.default : Jimptest
const { GifFrame, BitmapImage, GifUtil } = require('gifwrap')
const PseudoGif = require('../PseudoGif.js')

const { mod } = require('./TransformationUtil.js')

const genkiImageDefaultSpeed = 5
const imageDefaultInterval = 0

class Genki {
  static async transform (gif, { interval, speed }) {
    const frameList = []
    interval = parseInt(interval) || imageDefaultInterval
    const shift = parseInt(speed) || genkiImageDefaultSpeed

    const width = gif.width
    const newWidth = gif.width + interval
    const height = gif.height
    const length = gif.frames.length

    const originalReframed = gif.frames.map(frame => new GifFrame((new BitmapImage(frame.bitmap)).reframe(0, 0, newWidth, height, 0x00000000)))
    const originalJimp = gif.frames.map(frame => GifUtil.copyAsJimp(Jimp, frame.bitmap))

    for (let i = 0, frameIndex = 0; Math.abs(i) < newWidth; i += shift, frameIndex = (frameIndex + 1) % length) {
      const newImage = GifUtil.copyAsJimp(Jimp, originalReframed[frameIndex].bitmap)
        .scan(0, 0, newWidth, height, function (x, y, idx) {
          const rgba = originalJimp[frameIndex].getPixelColor(mod((x - i), newWidth), y)
          for (let j = 0; j < 4; j++) {
            this.bitmap.data[idx + j] = (rgba >> (24 - (j * 8))) % 256
          }
        })
      const fCopied = new GifFrame(newImage.bitmap).reframe(0, 0, width, height)
      frameList.push(fCopied)
    }
    return new PseudoGif(frameList, height, width)
  }
}
module.exports = { Genki }
