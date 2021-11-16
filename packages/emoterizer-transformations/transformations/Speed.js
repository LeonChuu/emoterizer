const PseudoGif = require('../PseudoGif.js')
class Speed {
  /**
   * @param {PseudoGif} gif image to be transformed.
   * @param {Object} options  - optional parameters
   * @returns {Promise<PseudoGif>}  transformed image.
   */
  static async transform (gif, { delay }) {
    const delayInRange = (this.validateDelay(parseFloat(delay)) || 1) + 1
    const outputFrameList = []

    gif.frames.forEach(frame => {
      frame.delayCentisecs = delayInRange
      outputFrameList.push(frame)
    })
    return new PseudoGif(outputFrameList, gif.height, gif.width)
  }

  static validateDelay (delay) {
    if ((delay < 1) || (delay > 100)) {
      throw RangeError('Delay must be a value between 1 and 100')
    }
    return delay
  }
}

module.exports = { Speed }
