const prefix = process.env.EMOTERIZER_PREFIX ?? '.yv'
const maxKbyteEmote = 250
const maxKbyteText = maxKbyteEmote.toString()
export const helpText = `
      usage: send an image with the message ${prefix} <command> [<options>] <emote>.
      You can send the emote as an attachment as well.
      Images larger than 125x125 are resized.
      Run ${prefix} help <command> to get options for each command.

      Commands:
      fliphorizontal - Flips the image horizontally.
      flipvertical - Flips the image vertically.
      genki - Genkis the image.
      pat - Headpats the image.
      roll - Creates a GIF with a rolling effect.
      santa - Places a santa hat on a image.
      shake - Creates a gif with a tremor effect.
      spin - Creates a GIF with a spinning effect.
      spiral - Creates a GIF with a spiral effect.
      zoom - Creates a GIF with a zooming effect.

      Example:

      ${prefix} pat offset 10 :awau:
    `

// TODO get values from command
// const values = {}
export function getSizeText (size: number): string {
  const sizeText = ('Gif size is: ' + size.toFixed(1) + 'KB')
  const optionalText = ((size) > maxKbyteEmote)
    ? ' and will not be able to be used as an emote due to being over ' + maxKbyteText + 'KB'
    : ''
  return sizeText + optionalText
}
