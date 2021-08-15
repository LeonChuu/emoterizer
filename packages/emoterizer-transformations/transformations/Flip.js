const Jimptest = require('jimp')
const Jimp = Jimptest.__esModule === true ? Jimptest.default : Jimptest
const { GifFrame, BitmapImage, GifUtil } = require('gifwrap')
const PseudoGif = require('../PseudoGif.js')

class Flip {
  static async transform (gif, options) {
    const direction = options.direction || 'horizontal'
    let horizontal = false
    let vertical = false
    if (direction === 'horizontal') {
      horizontal = true
    } else if (direction === 'vertical') {
      vertical = true
    } else if (direction === 'both') {
      horizontal = true
      vertical = true
    } else {
      throw Error('Invalid direction option.')
    }
    const frameList = gif.frames.map(frame => new GifFrame(
      new BitmapImage(
        GifUtil.copyAsJimp(Jimp, frame).flip(horizontal, vertical).bitmap)))
    return new PseudoGif(frameList, gif.height, gif.width)
  }
}

module.exports = { Flip }
