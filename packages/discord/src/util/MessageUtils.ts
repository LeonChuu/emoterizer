
import { Message, MessageEmbed } from 'discord.js'
import { Gif } from 'gifwrap'
import Embed from './Embed.js'
import { getSizeText, helpText } from './UtilityText.js'
import helpTextCommandJSON from '../../resources/helptext.json'
import thumbnailURLS from '../../resources/urls.json'
interface HelpText {
  [key: string]:
  {
    text: string
    thumbnailURL: string | undefined
  }
}

const helpTextCommands = (helpTextCommandJSON as HelpText)

const whitespaceRegex = /\s+/
// .yv at the first position, help at the second.
const commandPosition = 2

const successEmbed = new Embed(thumbnailURLS.successThumbnailURL, [0, 0, 255])
const failureEmbed = new Embed(thumbnailURLS.failureThumbnailURL, [255, 0, 0])

// shortens message.channel.send.
function send (message: Message, embed: MessageEmbed): void {
  message.channel.send(embed).finally(() => {})
}
/**
 * Sends message with help text for commands.
 * @param {Discord.message} message
 */
export function sendHelpMessage (message: Message): void {
  const commandRequest = message.content.split(whitespaceRegex)[commandPosition]
  const helpResponse = helpTextCommands[commandRequest]
  let responseEmbed
  if (commandRequest == null) {
    responseEmbed = successEmbed.generateEmbed('Help', helpText)
  } else if (helpResponse == null) {
    responseEmbed = successEmbed.generateEmbed('Help', 'subcommand not found.')
  } else {
    responseEmbed = successEmbed.generateEmbed('Help', helpResponse.text, undefined, helpResponse.thumbnailURL)
  }
  send(message, responseEmbed)
}

/**
 * Sends an message with a transformed gif.
 * @param {Discord.Message} message - Message to reply.
 * @param {Gif} gif - Gif to send.
 * @param {string} gifName - name of the gif file.
 */
export function sendTransformationMessage (message: Message, gif: Gif, gifName: string): void {
  const gifSize = gif.buffer.byteLength / 1024
  const framesText = 'Frames: ' + gif.frames.length.toString()
  const dimensionText = 'Dimensions: ' + gif.height.toString() + 'x' + gif.width.toString()

  // TODO change the attachment name to something better
  send(message, successEmbed.generateEmbed('Gif generated!',
    getSizeText(gifSize) + '\n' + framesText + '\n' + dimensionText)
  )
  message.channel.send({
    files: [{
      attachment: gif.buffer,
      name: gifName + '.gif'
    }]
  }).finally(() => {})
}

/**
 * Sends an error message.
 * @param {Discord.Message} message - Discord message to reply.
 * @param {string} errorText - error text.
 */
export function sendErrorMessage (message: Message, errorText: string): void {
  send(message, failureEmbed.generateEmbed('Failure', errorText))
}
