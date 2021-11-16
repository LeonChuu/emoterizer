
import { Transformation, PseudoGif } from 'emoterizer-transformations'
import { Gif } from 'gifwrap'
import { ImageData } from './ImageData'
/**
 * Executes transformations over an image.
 * @param {PseudoGif} image - gif to be transformed.
 * @param {object} args - Key value pairs of parameter and value to be used in transformations.
 * @returns {PseudoGif} result.
 */
async function transformImage (image: PseudoGif, args: {command: string }): Promise<PseudoGif> {
  let sourceImage
  try {
    sourceImage = Transformation.resizeDown(image)
  } catch (ex) {
    console.error(ex.message)
    console.error(ex.stack)
    throw new Error('Failed to resize image.')
  }
  return await transform(sourceImage, args)
}

/**
 * Main transformation picker. Define custom transformations here.
 * @param {PseudoGif} sourceImage image to be transformed.
 * @param {object} args - Key value pairs of parameter and value to be used in transformations.
 * @returns {PseudoGif} - transformed image.
 */
async function transform (sourceImage: PseudoGif, args: {command: string}): Promise<PseudoGif> {
  const command = args.command
  switch (command) {
    case 'fliphorizontal':
      return Transformation.transform(sourceImage, 'flip', { direction: 'horizontal' })
    case 'flipvertical':
      return Transformation.transform(sourceImage, 'flip', { direction: 'vertical' })
    default:
      return Transformation.transform(sourceImage, command, args)
  }
}
/**
 * Processes an image, resizing and excuting the specified transformation.
 * @param {ImageData} imageData - Image to be transformed.
 * @param {*} args - Key value pairs of parameter and value to be used in transformations.
 * @returns {Gif} - transformed image, encoded as a GIF.
 */
export async function generateTransformedGif (imageData: ImageData, args: {command: string}): Promise<Gif> {
  const transformedImage = await transformImage(imageData.image, args)
  return await Transformation.generateGif(transformedImage)
}

module.exports = { generateTransformedGif }