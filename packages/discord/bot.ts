import { Message, Client } from 'discord.js'
import { generateTransformedGif } from './src/image/ImageUtils.js'
import { parseInput, getImage, prefix } from './src/util/DecodingUtils.js'
import { sendHelpMessage, sendTransformationMessage, sendErrorMessage } from './src/util/MessageUtils.js'

const defaultTimeout = 4000
const activeUsers: Record<string, boolean| null> = {}
const token = process.env.TOKEN
const client = new Client()

client.login(token).catch(() => {
  console.log('ERROR! LOGIN FAILED')
  process.exit(1)
})

const asyncFunc: (message: Message) => void = async (message) => {
  const args = parseInput(message.content)
  let imageData
  if (args.prefixed) {
    const uid = message.author.id
    if (activeUsers[uid] == null) {
      activeUsers[uid] = true
      setTimeout(() => { activeUsers[uid] = null }, defaultTimeout)
    } else {
      sendErrorMessage(message, 'Wait a few seconds before repeating your request.')
      return
    }
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
          let errorMessage = ex.message
          if (ex.name === ReferenceError.name) {
            if (args.remainingArg != null) {
              errorMessage = 'Last argument should be a custom emote, but found ' + args.remainingArg + '\n' +
              'type \'' + prefix + ' help\' for help!'
            }
          }
          console.error(ex)
          console.error('Command: ' + args.command)
          sendErrorMessage(message, errorMessage)
          return
        }
        sendTransformationMessage(message, generatedGif, args.command + imageData.name)
    }
  }
}
// main listener
client.on('message', asyncFunc)

client.once('ready', () => {
  console.log('Ready!')
})
