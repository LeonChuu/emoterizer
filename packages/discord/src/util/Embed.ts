import Discord = require('discord.js')

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

  generateEmbed (fieldName: string, text: string, image?: string): Discord.MessageEmbed {
    const embed = new Discord.MessageEmbed()
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

module.exports = Embed
