import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

const handler = async (m) => {
  const jadiBotsPath = path.resolve('./JadiBots')
  if (!fs.existsSync(jadiBotsPath)) return m.reply('❌ No encontré la carpeta ./JadiBots.')

  const subBots = fs.readdirSync(jadiBotsPath).filter(f => {
    const fullPath = path.join(jadiBotsPath, f)
    return fs.lstatSync(fullPath).isDirectory()
  })

  if (!subBots.length) return m.reply('❌ No hay sub bots para reconectar.')

  let conectados = []
  let fallidos = []

  m.reply(`🔄 Reiniciando ${subBots.length} sub bots con PM2...`)

  for (const sub of subBots) {
    try {
      // Ajusta el nombre del proceso pm2 si no es igual al nombre de la carpeta
      await new Promise((resolve, reject) => {
        exec(`pm2 restart ${sub}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error reiniciando sub bot ${sub}:`, error)
            fallidos.push(sub)
            reject(error)
          } else {
            conectados.push(sub)
            resolve()
          }
        })
      })
    } catch {}
  }

  let texto = '📊 Resultado de reinicio de sub bots:\n\n'
  texto += `✅ Reiniciados (${conectados.length}):\n${conectados.length ? conectados.join('\n') : 'Ninguno'}\n\n`
  texto += `❌ Fallidos (${fallidos.length}):\n${fallidos.length ? fallidos.join('\n') : 'Ninguno'}`

  m.reply(texto)
}

handler.command = ['reconectar', 'recsubs', 'reconectarsubs']
export default handler