
const whitespaceRegex = /\s+/
// .yv at the first position, help at the second.
const commandPosition = 2

const { helpText, helpTextCommands, getSizeText } = require('./UtilityText')

const Embed = require('./Embed')

// TODO pass the following URLS to a CONFIG FILE.
const successThumbnail = process.env.SUCCESSTHUMBNAIL || 'https://cdn.discordapp.com/emojis/717325665795440680.png?v=1'
const failureThumbnail = process.env.FAILURETHUMBNAIL || 'https://cdn.discordapp.com/emojis/717326285818560562.png?v=1'

const successEmbed = new Embed([0, 0, 255], successThumbnail)
const failureEmbed = new Embed([255, 0, 0], failureThumbnail)

// shortens message.channel.send.
function send (message, embed) {
  message.channel.send(embed)
}
/**
 * Sends message with help text for commands.
 * @param {Discord.message} message
 */
function sendHelpMessage (message) {
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
function sendTransformationMessage (message, gif, gifName) {
  const gifSize = gif.buffer.byteLength / 1024
  const framesText = 'Frames: ' + gif.frames.length
  const dimensionText = 'Dimensions: ' + gif.height + 'x' + gif.width

  // TODO change the attachment name to something better
  send(message, successEmbed.generateEmbed('Gif generated!',
    getSizeText(gifSize) + '\n' + framesText + '\n' + dimensionText)
  )
  message.channel.send({
    files: [{
      attachment: gif.buffer,
      name: gifName + '.gif'
    }]
  })
}

/**
 * Sends an error message.
 * @param {Discord.Message} message - Discord message to reply.
 * @param {string} errorText - error text.
 */
function sendErrorMessage (message, errorText) {
  send(message, failureEmbed.generateEmbed('Failure', errorText))
}

module.exports = { sendHelpMessage, sendTransformationMessage, sendErrorMessage }
