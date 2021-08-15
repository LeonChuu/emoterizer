const Jimptest = require('jimp')
const Jimp = Jimptest.__esModule === true ? Jimptest.default : Jimptest
const { GifFrame, BitmapImage, GifUtil } = require('gifwrap')
const PseudoGif = require('../PseudoGif.js')
const { defaultHeight, defaultWidth } = require('../defaultsAndConstants.js')

const spiralImageDefaultZoom = 5
class Spiral {
  static async transform (gif, options) {
    const rotationSpeed = parseInt(options.rotationspeed) || 50
    const step = 90 * (rotationSpeed / 100) || 2
    const zoom = parseFloat(options.zoom) || spiralImageDefaultZoom
    const width = gif.width
    const height = gif.height
    const length = gif.frames.length
    let reframedImage
    const outputFrameList = []
    for (let i = 0, frameIndex = 0, position = 10; (i < 480) && (position < (width / 2)) &&
    (position < (height / 2)); i += 360 / step, position += zoom, frameIndex = (frameIndex + 1) % length) {
      const image = GifUtil.copyAsJimp(Jimp, gif.frames[frameIndex])
      image.rotate(i, false)
      reframedImage = GifUtil.copyAsJimp(Jimp, new BitmapImage(image.bitmap)
        .reframe(position, position, width - position * 2, height - position * 2))
      reframedImage.contain(defaultWidth, defaultHeight)
      position = position + 2
      outputFrameList.push(new GifFrame(new BitmapImage(reframedImage.bitmap)))
    }
    return new PseudoGif(outputFrameList, height, width)
  }
}

module.exports = { Spiral }
