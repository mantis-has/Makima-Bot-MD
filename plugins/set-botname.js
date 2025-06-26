// setbotname-subbot.js
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const newName = text.trim()

  if (!newName) {
    return m.reply(`*¡Ingresa el nuevo nombre del sub-bot!*\n\nEjemplo:\n${usedPrefix + command} YuruBot`)
  }

  // ✦ OBTENER NÚMERO DEL SUB-BOT QUE EJECUTA EL COMANDO
  const botJid = conn?.user?.id || conn?.auth?.creds?.me?.id?.split(':')[0]
  if (!botJid) return m.reply('❌ No se pudo identificar el número del sub-bot.')

  const botNumber = botJid.split('@')[0] // quita el @s.whatsapp.net

  // 📁 RUTA: ./JadiBots/NUMERO/config.json
  const currentDir = path.dirname(new URL(import.meta.url).pathname)
  const jadiBotsDir = path.join(currentDir, '..', '..', 'JadiBots')
  const subBotDir = path.join(jadiBotsDir, botNumber)
  const configPath = path.join(subBotDir, 'config.json')

  console.log(chalk.yellow(`[DEBUG] Ruta del config.json: ${configPath}`))

  // 📂 Verifica existencia de carpeta
  if (!fs.existsSync(subBotDir)) {
    return m.reply(`❌ No se encontró la carpeta del sub-bot: *${botNumber}*`)
  }

  // 📄 Lee o crea el archivo config.json
  let config = {}
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    } catch (e) {
      console.error(chalk.red(`❌ Error leyendo config.json de ${botNumber}`), e)
      return m.reply('❌ El archivo de configuración está dañado o no se pudo leer.')
    }
  }

  config.namebot = newName

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
    m.reply(`✅ Sub-Bot *${botNumber}* ahora se llama: *${newName}*`)
    console.log(chalk.green(`✅ Nombre actualizado para ${botNumber}: ${newName}`))
  } catch (e) {
    console.error(chalk.red(`❌ Error guardando el nombre del Sub-Bot ${botNumber}`), e)
    m.reply('❌ No se pudo guardar el nuevo nombre.')
  }
}

handler.command = /^setbotname$/i
handler.tags = ['owner']
handler.rowner = false
handler.limit = false

export default handler