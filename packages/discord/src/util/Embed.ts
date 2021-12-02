import { MessageEmbed } from 'discord.js'
export default class Embed {
  color: [number, number, number]
  defaultThumbnail: string

  /**
   *
   * @param {Integer[]} color
   * @param {string} defaultThumbnail
   */
  constructor (defaultThumbnail: string, color: [number, number, number] = [255, 0, 255]) {
    this.color = color
    this.defaultThumbnail = defaultThumbnail
  }

  generateEmbed (fieldName: string, text: string, image?: string, thumbnailURL?: string): MessageEmbed {
    const embed = new MessageEmbed()
    embed.addField(fieldName, text)
    embed.setColor(this.color)
    let thumbnail = this.defaultThumbnail

    if (thumbnailURL != null) {
      thumbnail = thumbnailURL
    }

    embed.setThumbnail(thumbnail)
    if (image != null) {
      embed.setImage(image)
    }
    return embed
  }
}
