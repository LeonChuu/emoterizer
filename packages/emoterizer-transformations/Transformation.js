/*
import Jimp from 'jimp'
import { GifFrame, BitmapImage, GifUtil, GifCodec } from 'gifwrap'
import { zoomImageDefaultZoom, rollImageDefaultSpeed, genkiImageDefaultSpeed, imageDefaultInterval, defaultHeight, defaultWidth } from './defaultsAndConstants.js'
import { PseudoGif } from './PseudoGif.js'
*/
const Jimptest = require('jimp')
// @ts-ignore
const Jimp = Jimptest.__esModule === true ? Jimptest.default : Jimptest
const { GifFrame, GifUtil, GifCodec } = require('gifwrap')
const {
  defaultHeight,
  defaultWidth
} = require('./defaultsAndConstants.js')
const PseudoGif = require('./PseudoGif.js')
const { Flip } = require('./transformations/Flip.js')
const { Genki } = require('./transformations/Genki.js')
const { Shake } = require('./transformations/Shake.js')
const { Speed } = require('./transformations/Speed.js')
const { Pat } = require('./transformations/Pat.js')
const { Roll } = require('./transformations/Roll.js')
const { Rotate } = require('./transformations/Rotate.js')
const { Spiral } = require('./transformations/Spiral.js')
const { Zoom } = require('./transformations/Zoom.js')

const transformMap = {
  flip: Flip,
  rotate: Rotate,
  spiral: Spiral,
  genki: Genki,
  zoom: Zoom,
  roll: Roll,
  pat: Pat,
  shake: Shake,
  spin: Rotate,
  speed: Speed
}

class Transformation {
  static transform (image, transformation, options) {
    return transformMap[transformation].transform(image, options)
  }

  static help (transformation) {
    return transformMap[transformation].help()
  }

  static async createGifBlob (gif, options) {
    const opt = (options == null) ? {} : options
    if (opt.quantization !== 'none') {
      GifUtil.quantizeWu(gif.frames, null)
    }
    let targetGif
    if (gif.buffer == null) {
      targetGif = await new GifCodec().encodeGif(gif.frames, { loops: 0 })
    } else {
      targetGif = gif
    }
    const blob = new window.Blob([targetGif.buffer], { type: 'image/gif' })
    return blob
  }

  static mod (n, m) {
    return ((n % m) + m) % m
  }

  static async updateImage (image, transformationType, values) {
    if (image == null) {
      return
    }
    let newImage = null
    console.log(values)
    if (transformationType != null) {
      const newFrameList = await Transformation.transform(image, transformationType, values)
      if (transformationType === 'speed') {
        // as only speed will be adjusted, quantization is unnecessary
        newImage = await Transformation.createGifBlob(newFrameList, { quantization: 'none' })
      } else {
        newImage = await Transformation.createGifBlob(newFrameList)
      }
      const output = {
        image: await window.URL.createObjectURL(newImage),
        frameNumber: newFrameList.length,
        size: newImage.size
      }
      return output
    }
  }

  static calculateGifSize (frameList) {
    const length = frameList.length
    if (length === 0) {
      return 0
    }
    console.log(frameList[0])
    return 4 * frameList[0].bitmap.width * frameList[0].bitmap.height * length
  }

  static async generateGif (gif) {
    const originalSpeed = gif.frames[0].delayCentisecs
    console.log(originalSpeed)
    GifUtil.quantizeSorokin(gif.frames, 256, 'top-pop')
    const newGif = await new GifCodec().encodeGif(gif.frames, null)
    newGif.frames.forEach(frame => {
      frame.delayCentisecs = originalSpeed
    })
    return newGif
  }

  static resizeDown (gif) {
    if ((gif.width !== defaultWidth) && (gif.height !== defaultHeight)) {
      const originalDelay = gif.frames[0].delayCentisecs
      console.log(originalDelay)
      const frames = gif.frames.map(frame => {
        const newFrame = new GifFrame(GifUtil.copyAsJimp(Jimp, frame.bitmap).resize(defaultHeight, defaultWidth).bitmap)
        newFrame.delayCentisecs = originalDelay
        return newFrame
      })
      return new PseudoGif(frames, defaultHeight, defaultWidth)
    } else {
      return gif
    }
  }
}
module.exports = Transformation
