import fetch from 'node-fetch'

let handler = async (m, { conn, command, args }) => {
  if (!args[0]) return conn.reply(m.chat, `☁︎ Por favor, ingrese el Link de una página.`, m)

  try {
    await m.react('⏳') // esperando
    conn.reply(m.chat, `🧠 Procesando su solicitud...`, m)

    let url = `https://image.thum.io/get/fullpage/${args[0]}`
    let res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    })

    if (!res.ok) throw new Error('No se pudo capturar la página')

    let ss = await res.buffer()

    await m.react('📸') // captura lista
    await conn.sendFile(m.chat, ss, 'captura.png', `✅ Captura de:\n${args[0]}`, m)

    await m.react('✅') // todo bien
  } catch (err) {
    console.error(err)
    await m.react('❌')
    return conn.reply(m.chat, `⚠️ Ocurrió un error al capturar la página.\nAsegúrese de que el enlace sea válido y que la página sea pública.`, m)
  }
}

handler.help = ['ss <página web>']
handler.tags = ['tools']
handler.command = ['ssweb', 'ss']

export default handler