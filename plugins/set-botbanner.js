import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, usedPrefix, command }) => {
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./JadiBots', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  const quoted = m.quoted ? m.quoted : m
  const mime = quoted?.mimetype || quoted?.msg?.mimetype || ''

  if (!/image\/(jpe?g|png|webp)/.test(mime)) {
    return m.reply(`🖼️ Manda o responde una imagen con *${usedPrefix + command}* pa poner el banner del menú.`)
  }

  if (!fs.existsSync(botPath)) {
    return m.reply('❌ No encontré tu sub bot activo.')
  }

  try {
    const buffer = await conn.download(quoted)
    const fileName = `banner-${senderNumber}.jpg`
    const savePath = path.join(botPath, fileName)

    fs.writeFileSync(savePath, buffer)

    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {}

    config.banner = savePath

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    m.reply(`✅ Banner guardado correctamente pa tu menú sub bot 😎`)
  } catch (e) {
    console.error('❌ Error al guardar banner:', e)
    m.reply('❌ No se pudo guardar el banner.')
  }
}

handler.command = /^setbotbanner$/i
handler.owner = true
export default handler