const Jimptest = require('jimp')
const Jimp = Jimptest.__esModule === true ? Jimptest.default : Jimptest
const { GifFrame, BitmapImage, GifUtil } = require('gifwrap')
const PseudoGif = require('../PseudoGif.js')

const zoomImageDefaultZoom = 5

class Zoom {
  static async transform (gif, { zoom }) {
    zoom = parseInt(zoom) || zoomImageDefaultZoom

    const width = gif.width
    const height = gif.height

    const outputFrameList = []

    for (let position = 10, frameIndex = 0; (position < (width / 2)) &&
    (position < (height / 2)); position += zoom, frameIndex = (frameIndex + 1) % gif.frames.length) {
      const zoomedImage = this.zoom(gif.frames[frameIndex], position, position)

      outputFrameList.push(new GifFrame(new BitmapImage(zoomedImage.bitmap)))
    }

    return new PseudoGif(outputFrameList, height, width)
  }

  static zoom (frame, verticalDist, horizontalDist) {
    const image = GifUtil.copyAsJimp(Jimp, frame)
    const width = image.bitmap.width
    const height = image.bitmap.height

    const reframedImage = GifUtil.copyAsJimp(Jimp, new BitmapImage(image.bitmap)
      .reframe(horizontalDist, verticalDist, width - horizontalDist * 2, height - verticalDist * 2, 0))
    reframedImage.contain(height, width)
    return reframedImage
  }
}

module.exports = { Zoom }
