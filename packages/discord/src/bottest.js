const { Transformation, PseudoGif } = require('emoterizer-transformations')
const Embed = require('./embed/Embed')
const Discord = require('discord.js')
const got = require('got')
const path = require('path')
const Jimp = require('jimp')

const { GifUtil, GifCodec, GifFrame, BitmapImage } = require('gifwrap')
const { helpText, helpTextCommands, getSizeText } = require('./util/UtilityText')
const ImageData = require('./util/ImageData')

const defaultTimeout = 4000
const activeUsers = {}
const token = process.env.TOKEN
const client = new Discord.Client()
const codec = new GifCodec()

const prefix = process.env.EMOTERIZER_PREFIX || '.yv'
const re = /\s+/
const emojiRE = /^<.*>$/
const emojiSplitRE = /:|>/
const discordEmojiURL = 'https://cdn.discordapp.com/emojis/'
const pat = GifUtil.read(path.resolve(__dirname, 'pat.gif'))

const successEmbed = new Embed([0, 0, 255], 'https://cdn.discordapp.com/emojis/717325665795440680.png?v=1')
const failureEmbed = new Embed([255, 0, 0], 'https://cdn.discordapp.com/emojis/717326285818560562.png?v=1')

function sendHelpMessage (message) {
  // grayscale - Converts the image to grayscale.
  const commandRequest = message.content.split(re)[2]
  let helpResponse = helpText
  if (commandRequest != null) {
    helpResponse = helpTextCommands[commandRequest]
    if (helpResponse == null) {
      helpResponse = 'Subcommand not found.'
    }
  }
  send(message, successEmbed.generateEmbed('Help', helpResponse))
}

client.login(token)
client.on('message', async message => {
  const args = parseInput(message.content)
  let imageData
  console.log(args)
  if (args.prefixed) {
    const uid = message.author.id
    if (activeUsers[uid] == null) {
      activeUsers[uid] = true
      setTimeout(() => { delete activeUsers[uid] }, defaultTimeout)
    } else {
      message.channel.send('Wait a few seconds before repeating your request.')
      return
    }

    args.image = await pat
    let generatedGif
    switch (args.command) {
      case 'help':
        sendHelpMessage(message)
        break
      default:
        try {
          imageData = await getImage(message, args)
          generatedGif = await generateTransformedGif(imageData, args)
        } catch (ex) {
          console.error(ex)
          console.error('Command: ' + args.command)
          send(message, failureEmbed.generateEmbed('Failure', ex.message))
        }
        sendTransformationMessage(message, generatedGif, args.command + imageData.name)
    }
  }
})

client.once('ready', () => {
  console.log('Ready!')
})

async function generateTransformedGif (imageData, args) {
  const transformedImage = await transformImage(imageData.image, args)
  return await Transformation.generateGif(transformedImage)
}

function sendTransformationMessage (message, gif, gifName) {
  const gifSize = gif.buffer.byteLength / 1024
  const framesText = 'Frames: ' + gif.frames.length
  const dimensionText = 'Dimensions: ' + gif.height + 'x' + gif.width

  // TODO change the attachment name to something better
  message.channel.send(null, {
    embed: successEmbed.generateEmbed('Gif generated!',
      getSizeText(gifSize) + '\n' + framesText + '\n' + dimensionText)
  })
  message.channel.send({
    files: [{
      attachment: gif.buffer,
      name: gifName + '.gif'
    }]
  })
}

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

function send (message, embed) {
  message.channel.send(embed)
}

function parseInput (inputLine) {
  const splitString = inputLine.split(re)
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
 *
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
 *
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

async function transformImage (image, args) {
  let sourceImage
  try {
    sourceImage = Transformation.resizeDown(image)
  } catch (ex) {
    console.error(ex.message)
    console.error(ex.stack)
    throw new Error('Failed to resize image.')
  }
  return transform(sourceImage, args)
}

async function transform (sourceImage, args) {
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
