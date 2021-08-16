const { Transformation, PseudoGif } = require('emoterizer-transformations')
const Discord = require('discord.js')
const fs = require('fs')
const got = require('got')
const path = require('path')
// const got = require('got')
const Jimp = require('jimp')
const defaultTimeout = 4000
const activeUsers = {}
const { GifUtil, GifCodec, GifFrame, BitmapImage } = require('gifwrap')
const token = process.env.TOKEN

const client = new Discord.Client()

const prefix = process.env.EMOTERIZER_PREFIX || '.yv'
const re = /\s+/
const emojiRE = /^<.*>$/
const emojiSplitRE = /:|>/
const discordEmojiURL = 'https://cdn.discordapp.com/emojis/'
const pat = GifUtil.read(path.resolve(__dirname, 'pat.gif'))

const helpText = `
      usage: send an image with the message ${prefix} <command> [<options>] <emote>.
      You can send the emote as an attachment as well.
      Run ${prefix} help <command> to get options for each command.

      Commands:
      fliphorizontal - Flips the image horizontally.
      flipvertical - Flips the image vertically.
      genki - Genkis the image.
      roll - Creates a GIF with a rolling effect.
      spin - Creates a GIF with a spinning effect.
      spiral - Creates a GIF with a spiral effect.
      zoom - Creates a GIF with a zooming effect.

      Example:

      ${prefix} pat offset 10 :awau:
    `
const helpTextCommands = {
  flipvertical: 'Flips a image vertically. \n ',
  fliphorizontal: 'Flips a image horizontally. \n ',
  genki: 'Applies a sliding effect to an image.\n Options:\n interval - empty space between frames in pixels.\n speed - sliding speed. ',
  pat: 'Headpats an image.\n Options:\n squish (0 to 100)\n offset (0 to 125)',
  roll: 'Applies a rolling effect.\n Options:\n rotationspeed\n speed\n',
  rotate: 'Applies a rotating effect.\n Options:\n rotationspeed\n',
  speed: 'Speeds up an gif.\n Options:\n delay ( 2 to 100) - delay between frames in centisecs.',
  spiral: 'Applies a spiral effect to an image.\n Options:\n rotationspeed\n zoom',
  zoom: 'Applies a zooming effect to an image.\n Options:\n zoom - zooming power/speed'

}

// TODO get values from command
// const values = {}
function getSizeText (size) {
  const sizeText = ('Gif size is: ' + size.toFixed(1) + 'KB')
  const optionalText = ((size) > 250)
    ? ' and will not be able to be used as an emote due to being over 250KB'
    : ''
  return sizeText + optionalText
}

function sendEmbedMessage (message, fieldName, text) {
  const embed = new Discord.MessageEmbed()
  embed.addField(fieldName, text)
  embed.setColor([255, 0, 255])
  message.channel.send(embed)
}

const commands = {
  test: (message) => {
    const buffer = fs.readFileSync('./pato.png')
    const attachment = new Discord.MessageAttachment(buffer, 'test.gif')

    message.channel.send('slep', attachment)
  },
  help: (message) => {
    // grayscale - Converts the image to grayscale.
    const commandRequest = message.content.split(re)[2]
    let helpResponse = helpText
    if (commandRequest != null) {
      helpResponse = helpTextCommands[commandRequest]
      if (helpResponse == null) {
        helpResponse = 'Subcommand not found.'
      }
    }
    sendEmbedMessage(message, 'Help', helpResponse)
  },
  fliphorizontal: async (message, image) => {
    return Transformation.transform(image, 'flipHorizontal')
  },
  flipvertical: async (message, image) => {
    return Transformation.transform(image, 'flipVertical')
  },
  grayscale: async (message, image, values) => {
    return Transformation.transform(image, 'grayscale', values)
  },
  genki: async (message, image, values) => {
    return Transformation.transform(image, 'genki', values)
  },
  pat: async (message, image, values) => {
    values.image = await pat
    // pat.then(p=>p.frames[0].scanAllIndexes( id => {}))
    return Transformation.transform(image, 'pat', values)
  },
  roll: async (message, image, values) => {
    return Transformation.transform(image, 'roll', values)
  },
  speed: async (message, image, values) => {
    return Transformation.transform(image, 'speed', values)
  },
  spin: async (message, image, values) => {
    return Transformation.transform(image, 'spin', values)
  },
  spiral: async (message, image, values) => {
    return Transformation.transform(image, 'spiral', values)
  },
  zoom: async (message, image, values) => {
    return Transformation.transform(image, 'zoom', values)
  }
}

client.login(token)
const codec = new GifCodec()
client.on('message', async message => {
  const args = parseInput(message.content)
  let hasImageToTransform = false
  let image
  let outputName

  console.log(args)
  if (args.prefixed) {
    const command = args.command
    console.log(command)
    const uid = message.author.id
    if (activeUsers[uid] == null) {
      activeUsers[uid] = true
      setTimeout(() => { delete activeUsers[uid] }, defaultTimeout)
    } else {
      message.channel.send('Wait a few seconds before repeating your request.')
      return
    }

    if (command === 'pat') {
      args.pat = await pat
    }
    if (message.attachments.size !== 0) {
      // Using only the first image in the attachment array.
      const attachment = message.attachments.first()
      outputName = attachment.name
      if (attachment.height != null) {
        console.log(args)
        const emojiURL = attachment.proxyURL
        try {
          image = await codec.decodeGif(Buffer.from((await got(emojiURL)).rawBody.buffer))
        } catch {
          const jimpImage = await Jimp.read(emojiURL)
          image = new PseudoGif([new GifFrame(new BitmapImage(jimpImage.bitmap))], jimpImage.getHeight(), jimpImage.getWidth())
        }
      }
      hasImageToTransform = true
    } else if ((args.remainingArg != null) && (args.remainingArg.search(emojiRE) >= 0)) {
      const emojiMatch = args.remainingArg.match(emojiRE)
      if (emojiMatch != null) {
        const emoji = emojiMatch[0].split(emojiSplitRE)
        console.log(emoji)
        const emojiNumber = emoji[2]
        outputName = emoji[1]
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
        hasImageToTransform = true
      } else {
        message.channel.send('Only custom emotes are allowed.')
      }
      console.log(args.remainingArg)
    } else {
      try {
        await commands[command](message)
      } catch (ex) {
        message.channel.send('Invalid command.')
        console.error(ex)
        console.error('Command: ' + command)
      }
    }
    console.log(hasImageToTransform)
    if (hasImageToTransform) {
      try {
        image = Transformation.resizeDown(image)
      } catch (ex) {
        message.channel.send('Invalid image.')
        console.error(ex.message)
        return
      }
      let transformedImage
      try {
        transformedImage = await commands[command](message, image, args)
      } catch (ex) {
        message.channel.send(ex.message)
        console.error(ex.message)
        return
      }
      const gif = await Transformation.generateGif(transformedImage)
      const gifSize = gif.buffer.byteLength / 1024

      // TODO change the attachment name to something better
      message.channel.send(getSizeText(gifSize), {
        files: [{
          attachment: gif.buffer,
          name: command + outputName + '.gif'
        }]
      })
    }
  }
})

client.once('ready', () => {
  console.log('Ready!')
})

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
