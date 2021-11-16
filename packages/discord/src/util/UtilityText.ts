const prefix = process.env.EMOTERIZER_PREFIX ?? '.yv'
const maxKbyteEmote = 250
const maxKbyteText = maxKbyteEmote.toString()
export const helpText = `
      usage: send an image with the message ${prefix} <command> [<options>] <emote>.
      You can send the emote as an attachment as well.
      Run ${prefix} help <command> to get options for each command.

      Commands:
      fliphorizontal - Flips the image horizontally.
      flipvertical - Flips the image vertically.
      genki - Genkis the image.
      roll - Creates a GIF with a rolling effect.
      shake - Creates a gif with a tremor effect.
      spin - Creates a GIF with a spinning effect.
      spiral - Creates a GIF with a spiral effect.
      zoom - Creates a GIF with a zooming effect.

      Example:

      ${prefix} pat offset 10 :awau:
    `
export const helpTextCommands: Record<string, string> = {
  flipvertical: 'Flips a image vertically. \n ',
  fliphorizontal: 'Flips a image horizontally. \n ',
  genki: 'Applies a sliding effect to an image.\n Options:\n interval - empty space between frames in pixels.\n speed - sliding speed. ',
  pat: 'Headpats an image.\n Options:\n squish (0 to 100)\n offset (0 to 125)',
  roll: 'Applies a rolling effect.\n Options:\n rotationspeed\n speed\n',
  rotate: 'Applies a rotating effect.\n Options:\n rotationspeed\n',
  shake: 'Applies a tremor effect.\n Options:\n delay ( 1 to 100) - delay between frames in centisecs. \n intensity (1 to 124) - shaking intensity',
  speed: 'Speeds up an gif.\n Options:\n delay ( 1 to 100) - delay between frames in centisecs.',
  spiral: 'Applies a spiral effect to an image.\n Options:\n rotationspeed\n zoom',
  zoom: 'Applies a zooming effect to an image.\n Options:\n zoom - zooming power/speed'

}

// TODO get values from command
// const values = {}
export function getSizeText (size: number): string {
  const sizeText = ('Gif size is: ' + size.toFixed(1) + 'KB')
  const optionalText = ((size) > maxKbyteEmote)
    ? ' and will not be able to be used as an emote due to being over ' + maxKbyteText + 'KB'
    : ''
  return sizeText + optionalText
}

module.exports = { helpText, getSizeText, helpTextCommands }
