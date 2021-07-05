const Jimptest = require('jimp')
const Jimp = Jimptest.__esModule === true ? Jimptest.default : Jimptest
const { GifFrame, BitmapImage, GifUtil } = require('gifwrap')
const PseudoGif = require('../PseudoGif.js')
class TransformationTemplate {
  /**
   * @param {PseudoGif|GifImage} gif image to be transformed.
   * @param {Object} options  - optional parameters
   * @returns {PseudoGif}  transformed image.
   */
  static async transform (gif, options) {
    throw Error('Not implemented')
  }

  static async helpText () {
    throw Error('Not implemented')
  }
}

module.exports = { TransformationTemplate }