const PseudoGif = require('../PseudoGif.js')
class Speed {
  /**
   * @param {PseudoGif|GifImage} gif image to be transformed.
   * @param {Object} options  - optional parameters
   * @returns {PseudoGif}  transformed image.
   */
  static async transform (gif, { delay }) {
    const delayInRange = (parseFloat(delay) || 1) + 1
    const outputFrameList = []
    gif.frames.forEach(frame => {
      frame.delayCentisecs = delayInRange
      outputFrameList.push(frame)
    })
    return new PseudoGif(outputFrameList, gif.height, gif.width)
  }

  static validateDelay (delay) {
    if ((delay < 1) || (delay > 100)) {
      throw RangeError('Speed must be between 1 and 100')
    }
  }
}

module.exports = { Speed }
