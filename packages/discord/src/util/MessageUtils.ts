
import { Message, MessageEmbed } from 'discord.js'
import { Gif } from 'gifwrap'
import Embed from './Embed'
import { helpText, helpTextCommands, getSizeText } from './UtilityText'
const whitespaceRegex = /\s+/
// .yv at the first position, help at the second.
const commandPosition = 2

// TODO pass the following URLS to a CONFIG FILE.
const successThumbnail = process.env.SUCCESSTHUMBNAIL ?? 'https://cdn.discordapp.com/emojis/717325665795440680.png?v=1'
const failureThumbnail = process.env.FAILURETHUMBNAIL ?? 'https://cdn.discordapp.com/emojis/717326285818560562.png?v=1'

const successEmbed = new Embed(successThumbnail, [0, 0, 255])
const failureEmbed = new Embed(failureThumbnail, [255, 0, 0])

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
  let helpResponse = helpText
  if (commandRequest != null) {
    helpResponse = helpTextCommands[commandRequest]
    if (helpResponse == null) {
      helpResponse = 'Subcommand not found.'
    }
  }
  send(message, successEmbed.generateEmbed('Help', helpResponse))
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

module.exports = { sendHelpMessage, sendTransformationMessage, sendErrorMessage }
