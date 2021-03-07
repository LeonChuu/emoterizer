import Transformation from '../graphical/Transformation.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const Discord = require('discord.js')
const fs = require('fs')
// const got = require('got')
const Jimp = require('jimp')
const token = process.env.TOKEN

const client = new Discord.Client()

const prefix = '.yv'
const re = /\s+/
const emojiRE = /^<.*>$/
const emojiSplitRE = /:|>/
const discordEmojiURL = 'https://cdn.discordapp.com/emojis/'

// TODO get values from command
const values = {}

const commands = {
  test: (message) => {
    const buffer = fs.readFileSync('./pato.png')
    const attachment = new Discord.MessageAttachment(buffer, 'test.gif')

    message.channel.send('slep', attachment)
  },
  help: (message) => {
    // grayscale - Converts the image to grayscale.
    const text = `
      usage: send an image with the message ${prefix} {command} .

      commands:
      fliphorizontal - Flips the image horizontally.
      flipvertical - Flips the image vertically.
      genki - Genkis the image.
      roll - Creates a GIF with a rolling effect.
      spin - Creates a GIF with a spinning effect.
      spiral - Creates a GIF with a spiral effect.
      zoom - Creates a GIF with a zooming effect.
    `
    message.channel.send(text)
  },
  fliphorizontal: async (message, image) => {
    return Transformation.transform('flipHorizontal', image)
  },
  flipvertical: async (message, image) => {
    return Transformation.transform('flipVertical', image)
  },
  grayscale: async (message, image, values) => {
    return Transformation.transform('grayscale', image, values)
  },
  genki: async (message, image, values) => {
    return Transformation.transform('genki', image, values)
  },
  roll: async (message, image, values) => {
    return Transformation.transform('roll', image, values)
  },
  spin: async (message, image, values) => {
    return Transformation.transform('rotate', image, values)
  },
  spiral: async (message, image, values) => {
    return Transformation.transform('spiral', image, values)
  },
  zoom: async (message, image, values) => {
    return Transformation.transform('zoom', image, values)
  }
}

client.login(token)
client.on('message', async message => {
  const args = parseInput(message.content)
  console.log(args)
  if (args.prefixed) {
    const command = args.command
    console.log(command)

    if (message.attachments.size !== 0) {
      message.attachments.forEach(async attachment => {
        if (attachment.height != null) {
          console.log(args)
          const image = Transformation.resizeDown(await Jimp.read(attachment.proxyURL))
          const transformedImage = await commands[command](message, image, args)
          const gif = await Transformation.generateGif(transformedImage)

          // TODO change the attachment name to something better
          message.channel.send({
            files: [{
              attachment: gif.buffer,
              name: command + attachment.name + '.gif'
            }]
          })
        }
      })
    } else if ((args.remainingArg != null) && (args.remainingArg.search(emojiRE) != null)) {
      const emojiMatch = args.remainingArg.match(emojiRE)
      if (emojiMatch != null) {
        const emoji = emojiMatch[0].split(emojiSplitRE)
        console.log(emoji)
        const emojiNumber = emoji[2]
        const emojiName = emoji[1]
        console.log(discordEmojiURL + emojiNumber + '.png')
        const image = Transformation.resizeDown(await Jimp.read(discordEmojiURL + emojiNumber + '.png'))
        const transformedImage = await commands[command](message, image, args)
        const gif = await Transformation.generateGif(transformedImage)

        // TODO change the attachment name to something better
        message.channel.send({
          files: [{
            attachment: gif.buffer,
            name: command + emojiName + '.gif'
          }]
        })
      } else {
        message.channel.send('Only custom emotes are allowed.')
      }
      console.log(args.remainingArg)
    } else {
      commands[command](message)
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

  if (splitString[0] === prefix) {
    content.prefixed = true
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
