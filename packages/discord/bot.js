const Discord = require('discord.js')
const path = require('path')

const { generateTransformedGif } = require('./src/image/ImageUtils')
const { parseInput, getImage } = require('./src/util/DecodingUtils')
const { sendHelpMessage, sendTransformationMessage, sendErrorMessage } = require('./src/util/MessageUtils')
const { GifUtil } = require('gifwrap')

const defaultTimeout = 4000
const activeUsers = {}
const token = process.env.TOKEN
const client = new Discord.Client()

const pat = GifUtil.read(path.resolve(__dirname, './resources/pat.gif'))

client.login(token)

// main listener
client.on('message', async message => {
  const args = parseInput(message.content)
  let imageData
  console.log(message.channel)
  if (args.prefixed) {
    const uid = message.author.id
    if (activeUsers[uid] == null) {
      activeUsers[uid] = true
      setTimeout(() => { delete activeUsers[uid] }, defaultTimeout)
    } else {
      sendErrorMessage(message, 'Wait a few seconds before repeating your request.')
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
          sendErrorMessage(message, ex.message)
        }
        sendTransformationMessage(message, generatedGif, args.command + imageData.name)
    }
  }
})

client.once('ready', () => {
  console.log('Ready!')
})
