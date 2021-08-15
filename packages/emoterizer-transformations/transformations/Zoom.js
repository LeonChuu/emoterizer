const Jimptest = require('jimp')
const Jimp = Jimptest.__esModule === true ? Jimptest.default : Jimptest
const { GifFrame, BitmapImage, GifUtil } = require('gifwrap')
const PseudoGif = require('../PseudoGif.js')

const zoomImageDefaultZoom = 5

class Zoom {
  static async transform (gif, options) {
    const zoom = options.zoom || zoomImageDefaultZoom

    const width = gif.width
    const height = gif.height

    const outputFrameList = []
    let reframedImage

    for (let position = 10, frameIndex = 0; (position < (width / 2)) &&
    (position < (height / 2)); position += zoom, frameIndex = (frameIndex + 1) % gif.frames.length) {
      const image = GifUtil.copyAsJimp(Jimp, gif.frames[frameIndex])

      reframedImage = GifUtil.copyAsJimp(Jimp, new BitmapImage(image.bitmap)
        .reframe(position, position, width - position * 2, height - position * 2))
      reframedImage.contain(height, width)

      outputFrameList.push(new GifFrame(new BitmapImage(reframedImage.bitmap)))
    }

    return new PseudoGif(outputFrameList, height, width)
  }
}

module.exports = { Zoom }
