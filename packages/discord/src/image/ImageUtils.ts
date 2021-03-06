
import { Transformation, PseudoGif } from 'emoterizer-transformations'
import { Gif, GifUtil } from 'gifwrap'
import { ImageData } from './ImageData.js'
import path from 'path'
export interface TransformationArguments {
  command: string
  content: Record<string, string>
  auxImage: Gif | undefined
}

const pat = GifUtil.read(path.resolve(__dirname, '../../resources/pat.gif'))
const santa = GifUtil.read(path.resolve(__dirname, '../../resources/santa.gif'))

/**
 * Executes transformations over an image.
 * @param {PseudoGif} image - gif to be transformed.
 * @param {object} args - Key value pairs of parameter and value to be used in transformations.
 * @returns {PseudoGif} result.
 */
async function transformImage (image: PseudoGif, args: TransformationArguments): Promise<PseudoGif> {
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
async function transform (sourceImage: PseudoGif, args: TransformationArguments): Promise<PseudoGif> {
  const command = args.command
  let auxImage = args.auxImage
  if (auxImage == null) {
    auxImage = await pat
  }
  const argument: Record<string, string | Gif | undefined> = {
    ...args.content,
    auxImage
  }
  switch (command) {
    case 'fliphorizontal':
      return Transformation.transform(sourceImage, 'flip', { direction: 'horizontal' })
    case 'flipvertical':
      return Transformation.transform(sourceImage, 'flip', { direction: 'vertical' })
    case 'santa':
      argument.auxImage = await santa
      return Transformation.transform(sourceImage, 'pat', argument)
    default:
      return Transformation.transform(sourceImage, command, argument)
  }
}
/**
 * Processes an image, resizing and excuting the specified transformation.
 * @param {ImageData} imageData - Image to be transformed.
 * @param {*} args - Key value pairs of parameter and value to be used in transformations.
 * @returns {Gif} - transformed image, encoded as a GIF.
 */
export async function generateTransformedGif (imageData: ImageData, args: TransformationArguments): Promise<Gif> {
  const transformedImage = await transformImage(imageData.image, args)
  return await Transformation.generateGif(transformedImage)
}
