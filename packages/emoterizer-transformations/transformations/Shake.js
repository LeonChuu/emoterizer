const Jimptest = require('jimp')
const Jimp = Jimptest.__esModule === true ? Jimptest.default : Jimptest
const { GifFrame, BitmapImage, GifUtil } = require('gifwrap')
const PseudoGif = require('../PseudoGif.js')
const { gifwrapDefaultDelay } = require('../defaultsAndConstants.js')
const { Speed } = require('./Speed')

// star-shaped movement for the shakes
const movement = [[1, 0], [-1, -1], [0, 1], [1, 0], [-1, 1]]

class Shake {
  static transform (gif, { intensity = 1, delay = gifwrapDefaultDelay }) {
    const width = gif.width
    const height = gif.height
    intensity = this.validateIntensity(Math.abs(parseInt(intensity)), width, height)

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
      outputGif = Speed.transform(outputGif, { delay })
    }
    return outputGif
  }

  // TODO pass this validation outside. Not crucial to execution.
  static validateIntensity (intensity, width, height) {
    if ((intensity >= width) || (intensity >= height)) {
      throw RangeError('Intensity must be smaller than height and width of image!')
    }
    return intensity
  }
}

module.exports = { Shake }
