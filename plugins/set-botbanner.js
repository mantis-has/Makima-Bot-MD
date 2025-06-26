import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, usedPrefix, command }) => {
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./JadiBots', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  // Verifica que envíe una imagen
  if (!m.msg || !m.msg.imageMessage) {
    return m.reply(`🖼️ Manda una imagen junto al comando *${usedPrefix + command}* para establecer el banner del menú.`)
  }

  // Asegura que la carpeta del sub bot exista
  if (!fs.existsSync(botPath)) {
    return m.reply('❌ No encontré tu sub bot activo.')
  }

  // Descarga la imagen
  try {
    const media = await conn.downloadAndSaveMediaMessage(m, `banner-${senderNumber}`)
    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {}

    config.banner = media // guarda ruta de imagen local

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    m.reply(`✅ Banner actualizado para el menú del sub bot.`)
  } catch (e) {
    console.error(e)
    m.reply('❌ Error al guardar el banner.')
  }
}

handler.command = /^setbotbanner$/i
handler.owner = false // Solo el dueño del sub bot
export default handler