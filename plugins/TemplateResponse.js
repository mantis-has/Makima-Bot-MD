import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, jidNormalizedUser } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import handler from './handler.js' // ✅ Ruta ajustada

const version = [2, 2323, 4] // Cámbialo según tu versión de baileys
const logger = console

async function reconnectSubBot(botPath) {
  const botName = path.basename(botPath)
  console.log(chalk.yellow(`🔁 Intentando reconectar sub-bot: ${botName}`))

  try {
    const { state, saveCreds } = await useMultiFileAuthState(botPath)

    const sock = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,
      browser: Browsers.ubuntu('Chrome'),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: true,
      syncFullHistory: true,
      retryRequestDelayMs: 10,
      transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
      maxMsgRetryCount: 15,
      appStateMacVerification: { patch: false, snapshot: false },
      getMessage: async (key) => {
        const jid = jidNormalizedUser(key.remoteJid)
        const msg = await sock?.store?.loadMessage?.(jid, key.id)
        return msg?.message || ''
      },
    })

    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
      if (connection === 'open') {
        console.log(chalk.green(`✅ Sub-bot conectado: ${botName}`))
      } else if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
        console.error(chalk.red(`❌ Sub-bot desconectado: ${botName}. Razón: ${reason}`))
      }
    })

    sock.ev.on('creds.update', saveCreds)

    if (handler?.handler) {
      sock.handler = handler.handler.bind(sock)
      sock.ev.on('messages.upsert', sock.handler)
      console.log(chalk.blue(`📨 Handler asignado: ${botName}`))
    }

    if (!global.subBots) global.subBots = {}
    global.subBots[botName] = sock

    return true
  } catch (e) {
    console.error(chalk.red(`💥 Error reconectando sub-bot ${botName}:`), e)
    return false
  }
}

const plugin = async (m) => {
  const jadiPath = path.resolve('./JadiBots')
  if (!fs.existsSync(jadiPath)) return m.reply('❌ No encontré la carpeta *./JadiBots*.')

  const subBots = fs.readdirSync(jadiPath).filter(folder => {
    const full = path.join(jadiPath, folder)
    return fs.lstatSync(full).isDirectory()
  })

  if (!subBots.length) return m.reply('⚠️ No hay sub bots en *./JadiBots*.')

  let ok = [], fail = []
  await m.reply(`🔁 Reconectando *${subBots.length}* sub bots...`)

  for (const folder of subBots) {
    const fullPath = path.join(jadiPath, folder)
    const success = await reconnectSubBot(fullPath)
    if (success) ok.push(folder)
    else fail.push(folder)
  }

  let msg = '📊 *Resultado de reconexión:*\n\n'
  msg += `✅ Conectados (${ok.length}):\n${ok.join('\n') || 'Ninguno'}\n\n`
  msg += `❌ Fallidos (${fail.length}):\n${fail.join('\n') || 'Ninguno'}`

  await m.reply(msg)
}

plugin.help = ['reconectar', 'recsubs']
plugin.tags = ['owner']
plugin.command = ['reconectar', 'recsubs', 'recsub']

export default plugin