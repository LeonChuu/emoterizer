const Jimptest = require('jimp')
const Jimp = Jimptest.__esModule === true ? Jimptest.default : Jimptest
const { GifFrame, GifUtil } = require('gifwrap')
const PseudoGif = require('../PseudoGif.js')

const { mod } = require('./TransformationUtil.js')

const rollImageDefaultSpeed = 20
const rollImageDefaultRotationSpeed = 40

class Roll {
  static async transform (gif, { rotationspeed, speed }) {
    rotationspeed = parseInt(rotationspeed) || rollImageDefaultRotationSpeed
    const shift = parseInt(speed) || rollImageDefaultSpeed
    const step = -(rotationspeed * 1.8) || -2
    const width = gif.width
    // const newWidth = image.bitmap.width + interval
    const newWidth = width * 3
    const height = gif.height
    const length = gif.frames.length
    const frameList = []
    //     const rotationLimit = 2280

    // const original = new GifFrame((new BitmapImage(image.bitmap)).reframe(0, 0, newWidth, height, 0x00000000))
    // const originalJimp = GifUtil.copyAsJimp(Jimp, original)

    // const originalJimp = gif.frames.map(frame => GifUtil.copyAsJimp(Jimp, frame))
    for (let i = 0, j = 0, frameIndex = 0; (Math.abs(i) < newWidth); i += shift, j += step, frameIndex = (frameIndex + 1) % length) {
      const original = GifUtil.copyAsJimp(Jimp, gif.frames[frameIndex].bitmap).rotate(j, false)
      const originalResized = new GifFrame(original.bitmap).reframe(-width, 0, newWidth, height, 0x00000000)
      const newImageAux = GifUtil.shareAsJimp(Jimp, originalResized)
      const newImage = GifUtil.copyAsJimp(Jimp, originalResized)
      newImage.scan(0, 0, newWidth, height, function (x, y, idx) {
        const rgba = newImageAux.getPixelColor(mod((x - i), newWidth), y)
        // console.log([this.bitmap.data[0], Object.options(Jimp.intToRGBA(newImage.getPixelColor((x + shift) % image.bitmap.width, y)))[0]])
        for (let k = 0; k < 4; k++) {
          this.bitmap.data[idx + k] = (rgba >> (24 - (k * 8))) % 256
        }
      })
      const fCopied = new GifFrame(newImage.bitmap).reframe(0, 0, width, height)
      frameList.push(fCopied)
    }
    return new PseudoGif(frameList, height, width)
  }
}

module.exports = { Roll }
