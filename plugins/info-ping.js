
const handler = async (m, { conn }) => {
  const start = Date.now()
  const msg = await m.reply('☄︎ Calculando ping...')
  const end = Date.now()
  const ping = end - start

  await conn.sendMessage(m.chat, {
    text: `☁︎ *Ping:* ${ping} ms`,
    edit: msg.key
  })
}

handler.command = ['ping', 'latencia']
handler.tags = ['info']
handler.help = ['ping']
handler.register = false

export default handler