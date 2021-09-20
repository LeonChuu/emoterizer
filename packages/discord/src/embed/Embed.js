const Discord = require('discord.js')

class Embed {
  /**
   *
   * @param {Integer[]} color
   * @param {string} thumbnail
   */
  constructor (color = [255, 0, 255], thumbnail) {
    this.color = color
    this.thumbnail = thumbnail
  }

  generateEmbed (fieldName, text, image) {
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
