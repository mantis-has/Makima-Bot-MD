import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, usedPrefix, command }) => {
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./JadiBots', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  // 🧩 Verifica si el mensaje es imagen o está respondiendo a una imagen
  const quoted = m.quoted ? m.quoted : m
  const mime = (quoted.msg || quoted).mimetype || ''

  if (!/image\/(jpe?g|png|webp)/.test(mime)) {
    return m.reply(`🖼️ Responde o manda una imagen junto al comando *${usedPrefix + command}* para poner el banner del menú.`)
  }

  if (!fs.existsSync(botPath)) {
    return m.reply('❌ No encontré tu sub bot activo.')
  }

  try {
    const media = await conn.downloadAndSaveMediaMessage(quoted, `banner-${senderNumber}`)
    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {}

    config.banner = media // guarda la ruta

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    m.reply(`✅ Banner actualizado con éxito.`)
  } catch (e) {
    console.error(e)
    m.reply('❌ Error al procesar la imagen.')
  }
}

handler.command = /^setbotbanner$/i
handler.owner = true
export default handler