import Jimp from 'jimp'
import { GifFrame, BitmapImage, GifUtil, GifCodec } from 'gifwrap'
import { zoomImageDefaultZoom, rollImageDefaultSpeed, genkiImageDefaultSpeed, imageDefaultInterval, defaultHeight, defaultWidth } from '../utils/defaultsAndConstants.js'
import { PseudoGif } from './PseudoGif.js'
export class Transformation {
  static transform (image, transformation, value) {
    const transformMap = {
      blit: (image, value) => Transformation.blitImage(image, value),
      flipVertical: (image) => Transformation.flipImage(image, { vertical: true }),
      flipHorizontal: (image) => Transformation.flipImage(image, { horizontal: true }),
      grayscale: (image) => image.grayscale(),
      pat: (image, value) => Transformation.patImage(image, value),
      rotate: (image, value) => Transformation.rotateImage(image, value),
      spiral: (image, value) => Transformation.spiralImage(image, value),
      genki: (image, value) => Transformation.genkiImage(image, value),
      zoom: (image, value) => Transformation.zoomImage(image, value),
      roll: (image, value) => Transformation.rollImage(image, value),
      speed: (image, value) => Transformation.speedImage(image, value),
      spin: (image, value) => Transformation.rotateImage(image, value)
    }
    return transformMap[transformation](image, value)
  }

  static async createGifBlob (gif, options) {
    const opt = (options == null) ? {} : options
    if (opt.quantization !== 'none') {
      console.log('qtizing')
      GifUtil.quantizeWu(gif.frames)
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

  // TODO iterate over full input gif
  static async patImage (gif, values) {
    const toBlit = values.image.frames

    const squishArg = values.squish || 0
    const offsetArg = values.offset || 0
    const squishVal = (Math.max(0, (100 - Math.abs(squishArg)) / 100.0))
    const yOffset = Math.max(0, Math.abs(offsetArg))
    const length = gif.frames.length

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
    return new PseudoGif(outputFrameList, gif.height, gif.width)
  }
  /*
  static async blitImage (image, values) {
    const toBlit = values.image.frames
    console.log(toBlit)

    const frameList = toBlit.map(frame => {
      const original = image.clone()
      return new GifFrame(new BitmapImage(original.composite(GifUtil.copyAsJimp(Jimp, frame), 0, 0).bitmap))
      // return new GifFrame(new BitmapImage(frame))
    })
    return newframeList
  }
  */

  static async flipImage (gif, values) {
    const horizontal = values.horizontal || false
    const vertical = values.vertical || false

    const frameList = gif.frames.map(frame => new GifFrame(
      new BitmapImage(
        GifUtil.copyAsJimp(Jimp, frame).flip(horizontal, vertical).bitmap)))
    return new PseudoGif(frameList, gif.height, gif.width)
  }

  static async genkiImage (gif, values) {
    const frameList = []
    const interval = values.interval || imageDefaultInterval
    const shift = values.speed || genkiImageDefaultSpeed

    const width = gif.width
    const newWidth = gif.width + interval
    const height = gif.height
    const length = gif.frames.length

    const originalReframed = gif.frames.map(frame => new GifFrame((new BitmapImage(frame)).reframe(0, 0, newWidth, height, 0x00000000)))
    const originalJimp = gif.frames.map(frame => GifUtil.copyAsJimp(Jimp, frame))

    for (let i = 0, frameIndex = 0; Math.abs(i) < newWidth; i += shift, frameIndex = (frameIndex + 1) % length) {
      const newImage = GifUtil.copyAsJimp(Jimp, originalReframed[frameIndex])
        .scan(0, 0, newWidth, height, function (x, y, idx) {
          const rgbaArray = Object.values(Jimp.intToRGBA(originalJimp[frameIndex].getPixelColor(Transformation.mod((x - i), newWidth), y)))
          // console.log([this.bitmap.data[0], Object.values(Jimp.intToRGBA(newImage.getPixelColor((x + shift) % image.bitmap.width, y)))[0]])
          for (let j = 0; j < 4; j++) {
            this.bitmap.data[idx + j] = rgbaArray[j]
          }
        })
      const fCopied = new GifFrame((new BitmapImage(newImage.bitmap)).reframe(0, 0, width, height))
      frameList.push(fCopied)
    }
    return new PseudoGif(frameList, height, width)
  }

  static async rollImage (gif, values) {
    const rotationSpeed = values.rotationspeed || 50
    const shift = values.speed || rollImageDefaultSpeed
    const step = -(rotationSpeed * 1.8) || -2
    const width = gif.width
    // const newWidth = image.bitmap.width + interval
    const newWidth = width * 3
    const height = gif.height
    const length = gif.frames.length
    const frameList = []
    //     const rotationLimit = 2280

    // const original = new GifFrame((new BitmapImage(image.bitmap)).reframe(0, 0, newWidth, height, 0x00000000))
    // const originalJimp = GifUtil.copyAsJimp(Jimp, original)

    for (let i = 0, j = 0, frameIndex = 0; (Math.abs(i) < newWidth); i += shift, j += step, frameIndex = (frameIndex + 1) % length) {
      const original = GifUtil.copyAsJimp(Jimp, gif.frames[frameIndex]).rotate(j, false)
      const originalResized = new GifFrame((new BitmapImage(original.bitmap)).reframe(-width, 0, newWidth, height, 0x00000000))
      const newImageAux = GifUtil.copyAsJimp(Jimp, originalResized)
      const newImage = GifUtil.copyAsJimp(Jimp, originalResized)
      newImage.scan(0, 0, newWidth, height, function (x, y, idx) {
        const rgbaArray = Object.values(Jimp.intToRGBA(newImageAux.getPixelColor(Transformation.mod((x - i), newWidth), y)))
        // console.log([this.bitmap.data[0], Object.values(Jimp.intToRGBA(newImage.getPixelColor((x + shift) % image.bitmap.width, y)))[0]])
        for (let k = 0; k < 4; k++) {
          this.bitmap.data[idx + k] = rgbaArray[k]
        }
      })
      const fCopied = new GifFrame((new BitmapImage(newImage.bitmap)).reframe(0, 0, width, height))
      frameList.push(fCopied)
    }
    return new PseudoGif(frameList, height, width)

    // return btoa(String.fromCharCode.apply(null, gif.buffer))
  }

  static async rotateImage (gif, values) {
    const rotationLimit = 360
    const rotationSpeed = values.rotationspeed || 50
    const step = -(rotationSpeed * 1.8) || -2
    const length = gif.frames.length
    const frameList = []
    for (let i = 0, frameIndex = 0; Math.abs(i) < rotationLimit; i += step, frameIndex = (frameIndex + 1) % length) {
      const image = GifUtil.copyAsJimp(Jimp, gif.frames[frameIndex])
      //    GifUtil.quantizeDekker(imageOrImages, maxColorIndexes, dither)
      image.rotate(i, false)
      const fCopied = new GifFrame(new BitmapImage(image.bitmap))
      frameList.push(fCopied)
    }
    return new PseudoGif(frameList, gif.height, gif.width)

    // return btoa(String.fromCharCode.apply(null, gif.buffer))
  }

  static async speedImage (gif, values) {
    const speed = parseInt(values.delay) || 1
    const outputFrameList = []
    gif.frames.forEach(frame => {
      frame.delayCentisecs = speed
      outputFrameList.push(frame)
    })
    return new PseudoGif(outputFrameList, gif.height, gif.width)
  }

  static async spiralImage (gif, values) {
    const rotationSpeed = parseInt(values.rotationspeed) || 50
    const step = 90 * (rotationSpeed / 100) || 2
    const zoom = parseFloat(values.zoom) || zoomImageDefaultZoom
    const width = gif.width
    const height = gif.height
    const length = gif.frames.length
    let reframedImage
    const outputFrameList = []
    for (let i = 0, frameIndex = 0, position = 10; (i < 480) && (position < (width / 2)) &&
    (position < (height / 2)); i += 360 / step, position += zoom, frameIndex = (frameIndex + 1) % length) {
      const image = GifUtil.copyAsJimp(Jimp, gif.frames[frameIndex])
      image.rotate(i, false)
      reframedImage = GifUtil.copyAsJimp(Jimp, new BitmapImage(image.bitmap)
        .reframe(position, position, width - position * 2, height - position * 2))
      reframedImage.contain(defaultWidth, defaultHeight)
      position = position + 2
      outputFrameList.push(new GifFrame(new BitmapImage(reframedImage.bitmap)))
    }
    return new PseudoGif(outputFrameList, height, width)

    // return btoa(String.fromCharCode.apply(null, gif.buffer))
  }

  static async zoomImage (gif, values) {
    let reframedImage
    console.log(values)
    const zoom = values.zoom || zoomImageDefaultZoom
    const width = gif.width
    const height = gif.height

    const outputFrameList = []
    for (let position = 10, frameIndex = 0; (position < (width / 2)) &&
    (position < (height / 2)); position += zoom, frameIndex = (frameIndex + 1) % gif.frames.length) {
      const image = GifUtil.copyAsJimp(Jimp, gif.frames[frameIndex])

      reframedImage = GifUtil.copyAsJimp(Jimp, new BitmapImage(image.bitmap)
        .reframe(position, position, width - position * 2, height - position * 2))
      reframedImage.contain(defaultHeight, defaultWidth)

      outputFrameList.push(new GifFrame(new BitmapImage(reframedImage.bitmap)))
    }

    return new PseudoGif(outputFrameList, height, width)

    // return btoa(String.fromCharCode.apply(null, gif.buffer))
  }

  static async updateImage (image, transformationType, values) {
    if (image == null) {
      return
    }
    let newImage = null
    console.log(values)
    if (transformationType != null) {
      const newFrameList = await Transformation.transform(image, transformationType, values)
      console.log('qtize')
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

  static generateGif (gif) {
    GifUtil.quantizeSorokin(gif.frames, 256, 'top-pop')
    return new GifCodec().encodeGif(gif.frames)
  }

  static resizeDown (jimpImage) {
    if ((jimpImage.bitmap.width !== defaultWidth) && (jimpImage.bitmap.defaultHeight !== defaultHeight)) {
      jimpImage.resize(defaultHeight, defaultWidth)
    }
    return jimpImage
  }
}
export default Transformation
