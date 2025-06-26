import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { useMultiFileAuthState, makeWASocket, Browsers, makeCacheableSignalKeyStore, jidNormalizedUser } from '@whiskeysockets/baileys'
import Boom from '@hapi/boom'
// Importa tu handler, asegurate que exporte la función que maneja mensajes
import handler from '../handler.js' // Ajusta ruta

const version = [2, 2306, 25] // Cambia si usas otra versión
const logger = console

async function reconnectSubBot(botPath) {
  const botName = path.basename(botPath)
  console.log(chalk.yellow(`Intentando reconectar sub-bot en: ${botName}`))
  try {
    const { state: subBotState, saveCreds: saveSubBotCreds } = await useMultiFileAuthState(botPath)
    const subBotConn = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,
      auth: {
        creds: subBotState.creds,
        keys: makeCacheableSignalKeyStore(subBotState.keys, logger),
      },
      browser: Browsers.ubuntu('Chrome'),
      markOnlineOnclientect: false,
      generateHighQualityLinkPreview: true,
      syncFullHistory: true,
      retryRequestDelayMs: 10,
      transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
      maxMsgRetryCount: 15,
      appStateMacVerification: { patch: false, snapshot: false },
      getMessage: async (key) => {
        const jid = jidNormalizedUser(key.remoteJid)
        if (subBotConn.store && subBotConn.store.loadMessage) {
          const msg = await subBotConn.store.loadMessage(jid, key.id)
          return msg?.message || ''
        }
        return ''
      },
    })

    subBotConn.ev.on('connection.update', ({ connection, lastDisconnect }) => {
      if (connection === 'open') {
        console.log(chalk.green(`Sub-bot conectado correctamente: ${botName}`))
      } else if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
        console.error(chalk.red(`Sub-bot desconectado en ${botName}. Razón: ${reason}`))
      }
    })

    subBotConn.ev.on('creds.update', saveSubBotCreds)

    if (handler && handler.handler) {
      subBotConn.handler = handler.handler.bind(subBotConn)
      subBotConn.ev.on('messages.upsert', subBotConn.handler)
      console.log(chalk.blue(`Manejador asignado al sub-bot: ${botName}`))
    } else {
      console.warn(chalk.yellow(`Advertencia: No se encontró el manejador para asignar al sub-bot: ${botName}`))
    }

    if (!global.subBots) global.subBots = {}
    global.subBots[botName] = subBotConn

    return botName
  } catch (e) {
    console.error(chalk.red(`Error al reconectar sub-bot en ${botName}:`), e)
    throw e
  }
}

async function reconnectAllSubBots(m) {
  const jadiBotsPath = path.resolve('./JadiBots')
  if (!fs.existsSync(jadiBotsPath)) {
    return m.reply('❌ No encontré la carpeta ./JadiBots.')
  }

  const subBots = fs.readdirSync(jadiBotsPath).filter(f => {
    const fullPath = path.join(jadiBotsPath, f)
    return fs.lstatSync(fullPath).isDirectory()
  })

  if (!subBots.length) return m.reply('❌ No hay sub bots para reconectar.')

  let conectados = []
  let fallidos = []

  await m.reply(`🔄 Empezando a reconectar ${subBots.length} sub bots...`)

  for (const sub of subBots) {
    const subPath = path.join(jadiBotsPath, sub)
    try {
      await reconnectSubBot(subPath)
      conectados.push(sub)
    } catch {
      fallidos.push(sub)
    }
  }

  let texto = '📊 Resultado de reconexión de sub bots:\n\n'
  texto += `✅ Conectados (${conectados.length}):\n${conectados.length ? conectados.join('\n') : 'Ninguno'}\n\n`
  texto += `❌ Fallidos (${fallidos.length}):\n${fallidos.length ? fallidos.join('\n') : 'Ninguno'}`

  await m.reply(texto)
}

export default {
  name: 'reconectarsubs',
  description: 'Reconecta todos los sub bots desde JadiBots',
  command: ['reconectar', 'recsubs', 'recsub'],
  run: reconnectAllSubBots
}