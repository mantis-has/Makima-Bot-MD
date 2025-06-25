// setbotname-subbot.js
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const newName = text.trim()
  if (!newName) {
    return m.reply(` Ingresa el nuevo nombre para el Sub-Bot.\n\nEjemplo:\n${usedPrefix + command} Yuru Kawaii`)
  }

  const sessionId = conn?.auth?.creds?.me?.id?.split(':')[0]
  if (!sessionId) return m.reply(' No se pudo identificar esta sesion de Sub-Bot.')

  const configPath = path.join(`./subbots/sesion-${sessionId}`, 'config.json')
  const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath)) : {}

  config.namebot = newName
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

  m.reply(` Nombre del Sub-Bot actualizado a: *${newName}*`)
}

handler.command = /^setbotname$/i
handler.mods = false

export default handler