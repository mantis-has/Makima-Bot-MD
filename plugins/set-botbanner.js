import fs from 'fs'
import path from 'path'
import { downloadMediaMessage } from '@whiskeysockets/baileys'

const handler = async (m, { conn, usedPrefix, command }) => {
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./JadiBots', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  const quoted = m.quoted ? m.quoted : m
  const mime = quoted?.mimetype || quoted?.msg?.mimetype || ''

  if (!/image\/(jpe?g|png|webp)/.test(mime)) {
    return m.reply(`🖼️ Manda o responde una imagen con *${usedPrefix + command}* para establecer el banner del menú.`)
  }

  if (!fs.existsSync(botPath)) {
    return m.reply('❌ No encontré tu sub bot activo.')
  }

  try {
    const buffer = await downloadMediaMessage(
      quoted,
      'buffer',
      {},
      { reuploadRequest: conn.updateMediaMessage }
    )

    const fileName = `banner-${senderNumber}.jpg`
    const savePath = path.join(botPath, fileName)
    fs.writeFileSync(savePath, buffer)

    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {}

    config.banner = savePath

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    m.reply(`✅ Banner del sub bot actualizado con éxito.`)
  } catch (err) {
    console.error('❌ Error al descargar o guardar el banner:', err)
    m.reply('❌ Ocurrió un error al guardar el banner.')
  }
}

handler.command = /^setbotbanner$/i
handler.owner = true
export default handler