
const prefix = process.env.EMOTERIZER_PREFIX || '.yv'
const whitespaceRegex = /\s+/
const emojiRE = /^<.*>$/
const emojiSplitRE = /:|>/
const discordEmojiURL = 'https://cdn.discordapp.com/emojis/'

const { PseudoGif } = require('emoterizer-transformations')
const { GifFrame, BitmapImage } = require('gifwrap')
const got = require('got')
const Jimp = require('jimp')
const ImageData = require('../image/ImageData')
const { GifCodec } = require('gifwrap')

const codec = new GifCodec()

/**
 * Parses a bot command.
 * @param {string} inputLine - discord message text.
 * @returns {object} - Key-value pairs of property and value, with the remaining arg under key remainingArg.
 */
function parseInput (inputLine) {
  const splitString = inputLine.split(whitespaceRegex)
  const content = {}

  if (splitString.length < 1) {
    throw Error
  }

  content.prefixed = (splitString[0] === prefix)
  if (!content.prefixed) {
    return content
  }

  content.command = splitString[1]

  splitString.splice(0, 2)
  // last remaining argument is stored, since loop won't reach it
  if ((splitString.length % 2) === 1) {
    content.remainingArg = splitString.pop()
  }

  // storing arguments in keyValue pairs
  for (let i = 1; i < splitString.length; i += 2) {
    content[splitString[i - 1]] = splitString[i]
  }
  return content
}

/**
 * Gets data from an emoji in a message line.
 * @param {Array} emoji - Regexp match of the emoji.
 * @returns {ImageData}
 */
async function decodeEmojiInArgument (emoji) {
  let image
  console.log(emoji)
  const emojiNumber = emoji[2]
  const outputName = emoji[1]
  const emojiURLPNG = discordEmojiURL + emojiNumber + '.png'
  const emojiURLGIF = discordEmojiURL + emojiNumber + '.gif'
  console.log(emojiURLPNG)
  try {
    image = await codec.decodeGif(Buffer.from((await got(emojiURLPNG)).rawBody.buffer))
  } catch {
    try {
      image = await codec.decodeGif(Buffer.from((await got(emojiURLGIF)).rawBody.buffer))
    } catch {
      const jimpImage = await Jimp.read(emojiURLPNG)
      image = new PseudoGif([new GifFrame(new BitmapImage(jimpImage.bitmap))], jimpImage.getHeight(), jimpImage.getWidth())
    }
  }
  console.log(image)

  return new ImageData(image, outputName)
}

/**
 * Gets data from an image in an attachment.
 * @param {Discord.MessageAttachment} attachment
 * @returns {ImageData}
 */
async function decodeEmojiInAttachment (attachment) {
  // Using only the first image in the attachment array.
  const outputName = attachment.name
  let image
  if (attachment.height != null) {
    const emojiURL = attachment.proxyURL
    try {
      image = await codec.decodeGif(Buffer.from((await got(emojiURL)).rawBody.buffer))
    } catch {
      const jimpImage = await Jimp.read(emojiURL)
      image = new PseudoGif([new GifFrame(new BitmapImage(jimpImage.bitmap))], jimpImage.getHeight(), jimpImage.getWidth())
    }
  }

  return new ImageData(image, outputName)
}

/**
 * gets an image from a discord Message.
 * @param {Message} message - Discord message data.
 * @param {object} args - parsed message arguments.
 * @returns {ImageData}
 */
async function getImage (message, args) {
  if (message.attachments.size !== 0) {
    return decodeEmojiInAttachment(message.attachments.first())
  } else if ((args.remainingArg != null) && (args.remainingArg.search(emojiRE) >= 0)) {
    const emojiMatch = args.remainingArg.match(emojiRE)
    if (emojiMatch != null) {
      return await decodeEmojiInArgument(emojiMatch[0].split(emojiSplitRE))
    } else {
      throw new Error('Failed to get image.')
    }
  } else {
    throw new ReferenceError('No image was found')
  }
}
module.exports = { getImage, parseInput, prefix }
