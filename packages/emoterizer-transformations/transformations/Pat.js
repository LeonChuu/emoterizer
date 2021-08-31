const Jimptest = require('jimp')
const Jimp = Jimptest.__esModule === true ? Jimptest.default : Jimptest
const { GifFrame, BitmapImage, GifUtil } = require('gifwrap')
const PseudoGif = require('../PseudoGif.js')
const { gifwrapDefaultDelay } = require('../defaultsAndConstants.js')
const { Speed } = require('./Speed')

class Pat {
  static async transform (gif, options) {
    const height = gif.height
    const width = gif.width
    const length = gif.frames.length
    const inputFrameList = gif.frames.map(frame => GifUtil.copyAsJimp(Jimp, frame))

    const squishArg = options.squish || 0
    const offsetArg = options.offset || 0
    const delay = options.delay || gifwrapDefaultDelay
    const toBlit = options.image.frames

    const squishVal = (Math.max(0, (100 - Math.abs(squishArg)) / 100.0))
    const yOffset = Math.max(0, Math.abs(offsetArg))
    const squishFactor = [[1.0, 1.0], [1.1 / squishVal, 0.98 * squishVal], [1.2 / squishVal, 0.95 * squishVal], [1.1 / squishVal, 0.96 * squishVal]]
    const background = GifUtil.copyAsJimp(Jimp, new BitmapImage(height, width, 0))

    const outputFrameList = toBlit.map((frame, index) => {
      const squish = squishFactor[index]
      const newFrame = inputFrameList[index % length].resize(width * squish[0], height * squish[1])
      const squishHeightOffset = height * (1 - squish[1]) + yOffset
      const handHeightOffset = height * (0.9 - squish[1])

      const original = background.clone().composite(newFrame,
        (width * (1 - squish[0])) / 2, squishHeightOffset).clone()

      return new GifFrame(new BitmapImage(original.composite(GifUtil.copyAsJimp(Jimp, frame), 0, handHeightOffset).bitmap))
    })
    let outputGif = new PseudoGif(outputFrameList, gif.height, gif.width)

    if (delay !== gifwrapDefaultDelay) {
      outputGif = Speed.transform(outputGif, { delay })
    }
    return outputGif
  }
}

module.exports = { Pat }
