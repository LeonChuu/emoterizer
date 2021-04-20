import Jimp from 'jimp'
import { GifFrame, BitmapImage, GifUtil, GifCodec } from 'gifwrap'
import { zoomImageDefaultZoom, rollImageDefaultSpeed, genkiImageDefaultSpeed, imageDefaultInterval, defaultHeight, defaultWidth } from '../utils/defaultsAndConstants.js'
export class Transformation {
  static transform (image, transformation, value) {
    const transformMap = {
      flipVertical: (image) => Transformation.flipImage(image, { vertical: true }),
      flipHorizontal: (image) => Transformation.flipImage(image, { horizontal: true }),
      grayscale: (image) => image.grayscale(),
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

  static async createGifBlob (frameList, options) {
    const opt = (options == null) ? {} : options
    const codec = new GifCodec()
    if (opt.quantization !== 'none') {
      console.log('qtizing')
      GifUtil.quantizeDekker(frameList)
    }
    const gif = await codec.encodeGif(frameList, { loops: 0 })
    const blob = new window.Blob([gif.buffer], { type: 'image/gif' })
    return blob
  }

  static mod (n, m) {
    return ((n % m) + m) % m
  }

  static async flipImage (image, values) {
    const horizontal = values.horizontal || false
    const vertical = values.vertical || false
    const frameList = []

    const copy = GifUtil.copyAsJimp(Jimp, image.bitmap).flip(horizontal, vertical)
    frameList.push(new GifFrame(new BitmapImage(copy.bitmap)))
    console.log(frameList)
    return frameList
  }

  static async genkiImage (image, values) {
    const frameList = []
    const interval = values.interval || imageDefaultInterval
    const shift = values.speed || genkiImageDefaultSpeed

    const width = image.bitmap.width
    const newWidth = image.bitmap.width + interval
    const height = image.bitmap.height

    const original = new GifFrame((new BitmapImage(image.bitmap)).reframe(0, 0, newWidth, height, 0x00000000))
    const originalJimp = GifUtil.copyAsJimp(Jimp, original)

    for (let i = 0; Math.abs(i) < newWidth; i += shift) {
      const newImage = GifUtil.copyAsJimp(Jimp, original)
        .scan(0, 0, newWidth, height, function (x, y, idx) {
          const rgbaArray = Object.values(Jimp.intToRGBA(originalJimp.getPixelColor(Transformation.mod((x - i), newWidth), y)))
          // console.log([this.bitmap.data[0], Object.values(Jimp.intToRGBA(newImage.getPixelColor((x + shift) % image.bitmap.width, y)))[0]])
          for (let j = 0; j < 4; j++) {
            this.bitmap.data[idx + j] = rgbaArray[j]
          }
        })
      const fCopied = new GifFrame((new BitmapImage(newImage.bitmap)).reframe(0, 0, width, height))
      frameList.push(fCopied)
    }
    return frameList
  }

  static async rollImage (image, values) {
    const rotationSpeed = values.rotationspeed || 50
    const shift = values.speed || rollImageDefaultSpeed
    const step = -(rotationSpeed * 1.8) || -2
    const width = image.bitmap.width
    // const newWidth = image.bitmap.width + interval
    const newWidth = image.bitmap.width * 3
    const height = image.bitmap.height
    const frameList = []
    //     const rotationLimit = 2280

    // const original = new GifFrame((new BitmapImage(image.bitmap)).reframe(0, 0, newWidth, height, 0x00000000))
    // const originalJimp = GifUtil.copyAsJimp(Jimp, original)

    for (let i = 0, j = 0; (Math.abs(i) < newWidth); i += shift, j += step) {
      const original = GifUtil.copyAsJimp(Jimp, image.bitmap).rotate(j, false)
      const originalResized = new GifFrame((new BitmapImage(original.bitmap)).reframe(-image.bitmap.width, 0, newWidth, height, 0x00000000))
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
    return frameList

    // return btoa(String.fromCharCode.apply(null, gif.buffer))
  }

  static async rotateImage (image, values) {
    const rotationLimit = 360
    const minRotationAngle = 90
    const rotationSpeed = values.rotationspeed || 50
    const step = minRotationAngle - (minRotationAngle * (rotationSpeed / 100)) || 2
    const frameList = []
    const original = new GifFrame(new BitmapImage(image.bitmap))
    for (let i = 0; Math.abs(i) < rotationLimit; i += rotationLimit / step) {
      image = GifUtil.copyAsJimp(Jimp, original)
      //    GifUtil.quantizeDekker(imageOrImages, maxColorIndexes, dither)
      image.rotate(i, false)
      const fCopied = new GifFrame(new BitmapImage(image.bitmap))
      frameList.push(fCopied)
    }
    return frameList

    // return btoa(String.fromCharCode.apply(null, gif.buffer))
  }

  static async speedImage (gif, values) {
    console.log(gif)
    const speed = parseInt(values.delay) || 1
    const test = await new GifCodec().decodeGif(gif)
    const frameList = test.frames
    frameList.forEach(frame => {
      frame.delayCentisecs = speed
    })
    return frameList
  }

  static async spiralImage (image, values) {
    const rotationSpeed = parseInt(values.rotationspeed) || 50
    const step = 90 * (rotationSpeed / 100) || 2
    const zoom = parseFloat(values.zoom) || zoomImageDefaultZoom
    const width = image.bitmap.width
    const height = image.bitmap.height
    let reframedImage
    const frameList = []
    console.log(values)
    console.log(zoom)
    console.log(step)
    const original = new GifFrame(new BitmapImage(image.bitmap))
    for (let i = 0, position = 10; (i < 480) && (position < (width / 2)) && (position < (height / 2)); i += 360 / step, position += zoom) {
      image = GifUtil.copyAsJimp(Jimp, original)
      console.log(image)
      image.rotate(i, false)
      reframedImage = GifUtil.copyAsJimp(Jimp, new BitmapImage(image.bitmap).reframe(position, position, width - position * 2, height - position * 2))
      reframedImage.contain(128, 128)
      position = position + 2
      frameList.push(new GifFrame(new BitmapImage(reframedImage.bitmap)))
    }
    return frameList

    // return btoa(String.fromCharCode.apply(null, gif.buffer))
  }

  static async zoomImage (image, values) {
    let reframedImage
    console.log(values)
    const zoom = values.zoom || zoomImageDefaultZoom
    const width = image.bitmap.width
    const height = image.bitmap.height
    const frameList = []
    const original = new GifFrame(new BitmapImage(image.bitmap))
    for (let position = 10; (position < (width / 2)) && (position < (height / 2)); position += zoom) {
      image = GifUtil.copyAsJimp(Jimp, original)

      reframedImage = GifUtil.copyAsJimp(Jimp, new BitmapImage(image.bitmap).reframe(position, position, width - position * 2, height - position * 2))
      reframedImage.contain(128, 128)

      frameList.push(new GifFrame(new BitmapImage(reframedImage.bitmap)))
      console.log(frameList)
    }
    return frameList

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
      if (transformationType === 'speed') {
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

  static generateGif (frameList) {
    const codec = new GifCodec()
    GifUtil.quantizeDekker(frameList)
    return codec.encodeGif(frameList)
  }

  static resizeDown (jimpImage) {
    jimpImage.resize(defaultHeight, defaultWidth)
    return jimpImage
  }
}
export default Transformation
