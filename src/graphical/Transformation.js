import Jimp from 'jimp'
import { GifFrame, BitmapImage, GifUtil, GifCodec } from 'gifwrap'
import { zoomImageDefaultZoom, rollImageDefaultSpeed, genkiImageDefaultSpeed, imageDefaultInterval, defaultHeight, defaultWidth } from '../utils/defaultsAndConstants.js'
export class Transformation {
  constructor (image, defaultValue) {
    defaultValue == null ? this.value = 50 : this.value = defaultValue
    this.originalImage = image
    this.transformMap = {
      flipVertical: (image) => this.flipImage(image, { vertical: true }),
      flipHorizontal: (image) => this.flipImage(image, { horizontal: true }),
      grayscale: (image) => image.grayscale(),
      rotate: (image, value) => this.rotateImage(image, value),
      spiral: (image, value) => this.spiralImage(image, value),
      genki: (image, value) => this.genkiImage(image, value),
      zoom: (image, value) => this.zoomImage(image, value),
      roll: (image, value) => this.rollImage(image, value)
    }
  }

  async createGifBlob (frameList) {
    const codec = new GifCodec()
    console.log('qtizing')
    GifUtil.quantizeDekker(frameList)
    const gif = await codec.encodeGif(frameList, { loops: 0 })
    const blob = new window.Blob([gif.buffer], { type: 'image/gif' })
    return window.URL.createObjectURL(blob)
  }

  mod (n, m) {
    return ((n % m) + m) % m
  }

  async flipImage (image, values) {
    const horizontal = values.horizontal || false
    const vertical = values.vertical || false
    const frameList = []

    const copy = GifUtil.copyAsJimp(Jimp, image.bitmap).flip(horizontal, vertical)
    frameList.push(new GifFrame(new BitmapImage(copy.bitmap)))
    console.log(frameList)
    return frameList
  }

  async genkiImage (image, values) {
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
          const rgbaArray = Object.values(Jimp.intToRGBA(originalJimp.getPixelColor(Transformation.prototype.mod((x - i), newWidth), y)))
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

  async rollImage (image, values) {
    const rotationTime = values.rotationTime || 50
    const step = 90 * (rotationTime / 100) || 2
    const interval = values.interval || imageDefaultInterval
    const shift = values.speed || rollImageDefaultSpeed

    const width = image.bitmap.width
    const newWidth = image.bitmap.width + interval
    const height = image.bitmap.height
    const frameList = []
    const rotationLimit = 2280

    // const original = new GifFrame((new BitmapImage(image.bitmap)).reframe(0, 0, newWidth, height, 0x00000000))
    // const originalJimp = GifUtil.copyAsJimp(Jimp, original)

    for (let i = 0, j = 0; (Math.abs(i) < newWidth) && (Math.abs(j) < rotationLimit); i += shift, j += step) {
      const original = GifUtil.copyAsJimp(Jimp, image.bitmap).rotate(j, false)
      const originalResized = new GifFrame((new BitmapImage(original.bitmap)).reframe(0, 0, newWidth, height, 0x00000000))
      const newImageAux = GifUtil.copyAsJimp(Jimp, originalResized)
      const newImage = GifUtil.copyAsJimp(Jimp, originalResized)
      newImage.scan(0, 0, newWidth, height, function (x, y, idx) {
        const rgbaArray = Object.values(Jimp.intToRGBA(newImageAux.getPixelColor(Transformation.prototype.mod((x - i), newWidth), y)))
        // console.log([this.bitmap.data[0], Object.values(Jimp.intToRGBA(newImage.getPixelColor((x + shift) % image.bitmap.width, y)))[0]])
        for (let j = 0; j < 4; j++) {
          this.bitmap.data[idx + j] = rgbaArray[j]
        }
      })
      const fCopied = new GifFrame((new BitmapImage(newImage.bitmap)).reframe(0, 0, width, height))
      frameList.push(fCopied)
    }
    return frameList

    // return btoa(String.fromCharCode.apply(null, gif.buffer))
  }

  async rotateImage (image, values) {
    const rotationTime = values.rotationTime || 50
    const step = 90 * (rotationTime / 100) || 2
    const frameList = []
    const rotationLimit = 360
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

  async spiralImage (image, values) {
    const rotationTime = parseInt(values.rotationTime) || 50
    const step = 90 * (rotationTime / 100) || 2
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

  async zoomImage (image, values) {
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

  async updateImage (transformationType, values) {
    if (this.originalImage == null) {
      return
    }
    const image = this.originalImage
    let newImage = null
    console.log(values)
    if (transformationType != null) {
      newImage = this.createGifBlob(await this.transformMap[transformationType](image, values))
      // this.setState({ image: await newImage }, () => console.log(this.state))
      // this.setState({ image: await newImage })
      return newImage
    }
    // this.setState({image: await image.getBase64Async('image/gif') }, () => console.log(this.state))
  }

  generateGif (frameList) {
    const codec = new GifCodec()
    GifUtil.quantizeDekker(frameList)
    return codec.encodeGif(frameList)
  }

  resizeDown (jimpImage) {
    jimpImage.resize(defaultHeight, defaultWidth)
    return jimpImage
  }
}
export default Transformation
