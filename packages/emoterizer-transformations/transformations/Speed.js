const PseudoGif = require('../PseudoGif.js')
class Speed {
  /**
   * @param {PseudoGif|GifImage} gif image to be transformed.
   * @param {Object} options  - optional parameters
   * @returns {PseudoGif}  transformed image.
   */
  static async transform (gif, options) {
    const speed = parseFloat(options.delay) || 1
    const outputFrameList = []
    gif.frames.forEach(frame => {
      frame.delayCentisecs = speed
      outputFrameList.push(frame)
    })
    return new PseudoGif(outputFrameList, gif.height, gif.width)
  }

  static async helpText () {
    return 'Speeds up an gif.\n Options:\n delay ( 2 to 100) - delay between frames in centisecs.'
  }
}

module.exports = { Speed }
