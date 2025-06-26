import fetch from 'node-fetch'

let handler = async (m, { conn, command, args }) => {
  if (!args[0]) return conn.reply(m.chat, `☁︎ Por favor, ingrese el Link de una página.`, m)

  try {
    await m.react('📍') // esperando
    conn.reply(m.chat, `Procesando su solicitud...`, m)

    await m.react('📸') // tomando captura
    let ss = await (await fetch(`https://image.thum.io/get/fullpage/${args[0]}`)).buffer()

    await m.react('🟢') // todo bien
    conn.sendFile(m.chat, ss, 'captura.png', `✅ Captura de:\n${args[0]}`, m)

    await m.react('👍') // éxito final
  } catch (err) {
    console.error(err)
    await m.react('❌')
    return conn.reply(m.chat, `⚠️ Ocurrió un error al capturar la página.\nVerifica que el enlace sea válido.`, m)
  }
}

handler.help = ['ss < página web >']
handler.tags = ['tools']
handler.command = ['ssweb', 'ss']

export default handler