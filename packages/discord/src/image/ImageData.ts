import { PseudoGif } from 'emoterizer-transformations'

export class ImageData {
  readonly image: PseudoGif
  readonly name: string

  constructor (image: PseudoGif, name: string) {
    this.image = image
    this.name = name
  }
}

module.exports = ImageData
