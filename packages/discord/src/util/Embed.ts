import { MessageEmbed } from 'discord.js'
export default class Embed {
  color: [number, number, number]
  thumbnail: string

  /**
   *
   * @param {Integer[]} color
   * @param {string} thumbnail
   */
  constructor (thumbnail: string, color: [number, number, number] = [255, 0, 255]) {
    this.color = color
    this.thumbnail = thumbnail
  }

  generateEmbed (fieldName: string, text: string, image?: string): MessageEmbed {
    const embed = new MessageEmbed()
    embed.addField(fieldName, text)
    embed.setColor(this.color)
    embed.setThumbnail(this.thumbnail)
    if (image != null) {
      embed.setImage(image)
      console.log(image)
    }
    return embed
  }
}
