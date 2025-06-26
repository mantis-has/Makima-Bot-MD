import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, usedPrefix, command }) => {
  // Solo dueño del bot puede usarlo
  if (!global.owner || !global.owner.includes(m.sender.split('@')[0])) {
    return m.reply('❌ Solo el dueño puede usar este comando.')
  }

  // Leer todos los sub bots (nombres de carpetas en ./JadiBots)
  const jadiBotsPath = path.resolve('./JadiBots')
  if (!fs.existsSync(jadiBotsPath)) {
    return m.reply('❌ No encontré la carpeta ./JadiBots.')
  }

  const subBots = fs.readdirSync(jadiBotsPath).filter(f => {
    const fullPath = path.join(jadiBotsPath, f)
    return fs.lstatSync(fullPath).isDirectory()
  })

  if (!subBots.length) {
    return m.reply('❌ No hay sub bots para reconectar.')
  }

  m.reply(`🔄 Reconectando ${subBots.length} sub bots...`)

  // recbots debe ser global o importarlo si lo tienes
  // Ejemplo: global.recbots o import { recbots } from '...'
  if (typeof global.recbots !== 'function') {
    return m.reply('❌ No encontré la función recbots para reconectar.')
  }

  try {
    for (const sub of subBots) {
      await global.recbots(sub)
    }
    m.reply('✅ Todos los sub bots se reconectaron exitosamente.')
  } catch (e) {
    console.error('Error reconectando sub bots:', e)
    m.reply('❌ Ocurrió un error reconectando los sub bots.')
  }
}

handler.command = ['reconectar', 'recsubs', 'reconectarsubs']
handler.rowner = true
export default handler