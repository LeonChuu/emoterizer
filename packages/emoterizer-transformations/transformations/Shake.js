const Jimptest = require('jimp')
const Jimp = Jimptest.__esModule === true ? Jimptest.default : Jimptest
const { GifFrame, BitmapImage, GifUtil } = require('gifwrap')
const PseudoGif = require('../PseudoGif.js')
const { gifwrapDefaultDelay } = require('../defaultsAndConstants.js')

// star-shaped movement for the shakes
const movement = [[1, 0], [-1, -1], [0, 1], [1, 0], [-1, 1]]

class Shake {
  static transform (gif, options) {
    const intensity = Math.abs(parseInt(options.intensity)) || 1
    const delay = options.delay || gifwrapDefaultDelay

    const width = gif.width
    const height = gif.height

    const outputFrameList = []

    const gifLength = gif.frames.length
    const maxFrames = Math.max(gifLength, movement.length)

    for (let i = 0; i < maxFrames; i++) {
      const currentMovement = movement[i % movement.length]
      const frame = GifUtil.copyAsJimp(Jimp, gif.frames[i % gifLength])

      frame.contain(width + 2 * intensity, height + 2 * intensity)

      const shakenFrame = new BitmapImage(frame.bitmap).reframe(
        intensity + currentMovement[0] * intensity,
        intensity + currentMovement[1] * intensity,
        width, height, 0)

      outputFrameList.push(new GifFrame(shakenFrame))
    }

    let outputGif = new PseudoGif(outputFrameList, height, width)
    if (delay !== gifwrapDefaultDelay) {
      outputGif = this.speedImage(outputGif, { delay })
    }
    return outputGif
  }
}

module.exports = { Shake }
