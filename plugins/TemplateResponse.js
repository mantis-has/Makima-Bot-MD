import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
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

  if (typeof global.recbots !== 'function') {
    return m.reply('❌ No encontré la función recbots para reconectar.')
  }

  let conectados = []
  let fallidos = []

  m.reply(`🔄 Empezando a reconectar ${subBots.length} sub bots...`)

  for (const sub of subBots) {
    try {
      await global.recbots(sub)
      conectados.push(sub)
    } catch (e) {
      fallidos.push(sub)
    }
  }

  let texto = '📊 Resultado de reconexión de sub bots:\n\n'
  texto += `✅ Conectados (${conectados.length}):\n${conectados.length ? conectados.join('\n') : 'Ninguno'}\n\n`
  texto += `❌ Fallidos (${fallidos.length}):\n${fallidos.length ? fallidos.join('\n') : 'Ninguno'}`

  m.reply(texto)
}

handler.command = ['reconectar', 'recsubs', 'reconectarsubs']
export default handler