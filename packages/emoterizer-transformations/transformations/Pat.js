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
    const inputFrameList = gif.frames.map(frame => GifUtil.copyAsJimp(Jimp, frame.bitmap))

    const squishArg = parseInt(options.squish) || 0
    const argOffsety = parseInt(options.offsety || 0)
    const argOffsetx = parseInt(options.offsetx || 0)
    let argSquishOffsetx = 0
    let argSquishOffsety = 0
    let argHandOffsetx = 0
    let argHandOffsety = 0

    if (options.relative === 'main') {
      argSquishOffsetx = argOffsetx
      argSquishOffsety = argOffsety
    } else {
      argHandOffsetx = argOffsetx
      argHandOffsety = argOffsety
    }

    const delay = parseInt(options.delay) || gifwrapDefaultDelay
    const toBlit = options.auxImage.frames

    const squishVal = (Math.max(0, (100 - Math.abs(squishArg)) / 100.0))
    const squishFactor = [[1.0, 1.0], [1.1 / squishVal, 0.90 * squishVal], [1.2 / squishVal, 0.85 * squishVal], [1.1 / squishVal, 0.93 * squishVal]]
    const background = GifUtil.copyAsJimp(Jimp, new BitmapImage(height, width, 0))

    const outputFrameList = toBlit.map((frame, index) => {
      const squish = squishFactor[index]
      const newFrame = inputFrameList[index % length].resize(width * squish[0], height * squish[1])
      const squishOffsety = height * (1 - squish[1]) + argSquishOffsety
      const squishOffsetx = ((width * (1 - squish[0])) / 2) + argSquishOffsetx
      const handOffsety = height * (0.9 - squish[1]) + argHandOffsety
      const handOffsetx = argHandOffsetx

      const original = background.clone().composite(newFrame,
        squishOffsetx, squishOffsety).clone()

      return new GifFrame(new BitmapImage(original.composite(GifUtil.copyAsJimp(Jimp, frame.bitmap), handOffsetx, handOffsety).bitmap))
    })
    let outputGif = new PseudoGif(outputFrameList, gif.height, gif.width)

    if (delay !== gifwrapDefaultDelay) {
      outputGif = await Speed.transform(outputGif, { delay })
    }
    return outputGif
  }
}

module.exports = { Pat }
