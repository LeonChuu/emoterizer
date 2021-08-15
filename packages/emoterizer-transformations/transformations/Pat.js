const Jimptest = require('jimp')
const Jimp = Jimptest.__esModule === true ? Jimptest.default : Jimptest
const { GifFrame, BitmapImage, GifUtil } = require('gifwrap')
const PseudoGif = require('../PseudoGif.js')
const { gifwrapDefaultDelay, defaultHeight, defaultWidth } = require('../defaultsAndConstants.js')

class Pat {
  static async transform (gif, options) {
    const toBlit = options.image.frames

    const squishArg = options.squish || 0
    const offsetArg = options.offset || 0
    const squishVal = (Math.max(0, (100 - Math.abs(squishArg)) / 100.0))
    const yOffset = Math.max(0, Math.abs(offsetArg))
    const length = gif.frames.length
    const delay = options.delay || gifwrapDefaultDelay
    const inputFrameList = gif.frames.map(frame => GifUtil.copyAsJimp(Jimp, frame))
    const squishFactor = [[1.0, 1.0], [1.1 / squishVal, 0.98 * squishVal], [1.2 / squishVal, 0.95 * squishVal], [1.1 / squishVal, 0.96 * squishVal]]
    const background = GifUtil.copyAsJimp(Jimp, new BitmapImage(defaultHeight, defaultWidth, 0))

    const outputFrameList = toBlit.map((frame, index) => {
      const squish = squishFactor[index]
      const newFrame = inputFrameList[index % length].resize(defaultWidth * squish[0], defaultHeight * squish[1])
      const squishHeightOffset = defaultHeight * (1 - squish[1]) + yOffset
      const handHeightOffset = defaultHeight * (0.9 - squish[1])
      const original = background.clone().composite(newFrame,
        (defaultWidth * (1 - squish[0])) / 2, squishHeightOffset).clone()
      // const original = GifUtil.copyAsJimp(Jimp, newFrame.reframe(0, yOffset, edgeLength, edgeLength, 0))
      return new GifFrame(new BitmapImage(original.composite(GifUtil.copyAsJimp(Jimp, frame), 0, handHeightOffset).bitmap))
      // return new GifFrame(new BitmapImage(frame))
    })
    let outputGif = new PseudoGif(outputFrameList, gif.height, gif.width)

    if (delay !== gifwrapDefaultDelay) {
      console.log(delay)
      outputGif = this.speedImage(outputGif, { delay })
    }
    return outputGif
  }
}

module.exports = { Pat }
