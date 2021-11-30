
import { ImageData } from '../image/ImageData'
import { PseudoGif } from 'emoterizer-transformations'
import { GifFrame, BitmapImage, GifCodec, Gif } from 'gifwrap'
import { TransformationArguments } from '../image/ImageUtils'
import Discord = require('discord.js')
import { MessageAttachment } from 'discord.js'
import got from 'got'
import Jimp = require('jimp')

export const prefix = process.env.EMOTERIZER_PREFIX ?? '.yv'
const whitespaceRegex = /\s+/
const emojiRE = /^<.*>$/
const emojiSplitRE = /:|>/
const discordEmojiURL = 'https://cdn.discordapp.com/emojis/'

const codec = new GifCodec()

interface Arguments extends TransformationArguments {
  prefixed: boolean
  command: string
  remainingArg: string | undefined
  content: Record<string, string>
  auxImage: Gif| undefined
}


/**
 * Parses a bot command.
 * @param {string} inputLine - discord message text.
 * @returns {Arguments} - Key-value pairs of property and value, with the remaining arg under key remainingArg.
 */
export function parseInput (inputLine: string): Arguments {
  const splitString = inputLine.split(whitespaceRegex)
  const args: Arguments = {
    prefixed: false,
    command: '',
    remainingArg: undefined,
    content: {},
    auxImage: undefined
  }
  console.log(splitString)
  if (splitString.length < 1) {
    throw new Error('No arguments found.')
  }

  args.prefixed = (splitString[0] === prefix)
  if (!args.prefixed) {
    return args
  }

  args.command = splitString[1]

  splitString.splice(0, 2)
  // last remaining argument is stored, since loop won't reach it
  if ((splitString.length % 2) === 1) {
    args.remainingArg = splitString.pop()
  }

  // storing arguments in keyValue pairs
  for (let i = 1; i < splitString.length; i += 2) {
    args.content[splitString[i - 1]] = splitString[i]
  }
  return args
}

/**
 * Gets data from an emoji in a message line.
 * @param {Array} emoji - Regexp match of the emoji.
 * @returns {ImageData}
 */
async function decodeEmojiInArgument (emoji: string[]): Promise<ImageData> {
  let image
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
async function decodeEmojiInAttachment (attachment: MessageAttachment): Promise<ImageData> {
  // Using only the first image in the attachment array.
  const outputName = attachment.name ?? 'defaultName'
  let image
  const emojiURL = attachment.proxyURL
  try {
    image = await codec.decodeGif(Buffer.from((await got(emojiURL)).rawBody.buffer))
  } catch {
    const jimpImage = await Jimp.read(emojiURL)
    image = new PseudoGif([new GifFrame(new BitmapImage(jimpImage.bitmap))], jimpImage.getHeight(), jimpImage.getWidth())
  }
  return new ImageData(image, outputName)
}

/**
 * gets an image from a discord Message.
 * @param {Message} message - Discord message data.
 * @param {object} args - parsed message arguments.
 * @returns {ImageData}
 */
export async function getImage (message: Discord.Message, args: Arguments): Promise<ImageData> {
  const attachment = message.attachments.first()
  console.log(args)
  if (attachment !== undefined) {
    return await decodeEmojiInAttachment(attachment)
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
