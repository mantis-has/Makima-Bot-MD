// setbotname-subbot.js
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const parts = text.trim().split(/\s+/)
  const subBotNumber = parts[0]
  const newName = parts.slice(1).join(' ')

  if (!subBotNumber || !newName) {
    return m.reply(`*¡Usa el formato correcto!*\n\nEjemplo:\n${usedPrefix + command} 50493732693 Yuru Kawaii`)
  }

  // Lógica para construir la ruta
  const currentPluginDir = path.dirname(new URL(import.meta.url).pathname)
  const projectRootCandidate = path.join(currentPluginDir, '..', '..', '..')
  const jadiBotsBaseDir = path.join(projectRootCandidate, 'JadiBots')
  const sessionDir = path.join(jadiBotsBaseDir, subBotNumber)

  console.log(chalk.yellow(`[DEBUG] jadiBotsBaseDir: ${jadiBotsBaseDir}`))
  console.log(chalk.yellow(`[DEBUG] sessionDir: ${sessionDir}`))

  // Verifica existencia de carpeta base y del sub-bot
  if (!fs.existsSync(jadiBotsBaseDir)) {
    console.error(chalk.red(`Error: No existe la carpeta base JadiBots en ${jadiBotsBaseDir}`))
    return m.reply('❌ No se encontró la carpeta principal JadiBots.')
  }

  if (!fs.existsSync(sessionDir)) {
    console.error(chalk.red(`Error: No existe la carpeta del sub-bot ${subBotNumber} en ${sessionDir}`))
    return m.reply(`❌ No se encontró la carpeta para el sub-bot *${subBotNumber}*.`)
  }

  const configPath = path.join(sessionDir, 'config.json')
  let config = {}

  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    } catch (e) {
      console.error(chalk.red(`❌ Error al leer el config.json del sub-bot ${subBotNumber}`), e)
      return m.reply('❌ Error leyendo la configuración actual del sub-bot.')
    }
  }

  config.namebot = newName

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
    m.reply(`✅ El nombre del sub-bot *${subBotNumber}* fue actualizado a: *${newName}*`)
    console.log(chalk.green(`✅ Sub-Bot ${subBotNumber} actualizado con éxito.`))
  } catch (e) {
    console.error(chalk.red(`❌ Error guardando el config.json del sub-bot ${subBotNumber}`), e)
    m.reply('❌ No se pudo guardar la nueva configuración.')
  }
}

handler.command = /^setbotname$/i
handler.tags = ['owner']
handler.rowner = false
handler.limit = false

export default handler