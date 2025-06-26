import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let url = args[0]
  if (!url || !/(youtube\.com|youtu\.be)/i.test(url))
    return m.reply(`✦ Usa el comando así:\n${usedPrefix + command} <enlace de YouTube>\n\nEjemplo:\n${usedPrefix + command} https://youtube.com/watch?v=abc123`)

  try {
    m.react('🎥') // Reacción mientras carga

    const api = `https://theadonix-api.vercel.app/api/ytmp4?url=${encodeURIComponent(url)}`
    const res = await fetch(api)
    const json = await res.json()

    if (json.status !== 200 || !json.result?.video) throw '❌ No se pudo obtener el video'

    let result = json.result

    // Verificar si el archivo es accesible antes de enviar
    const test = await fetch(result.video)
    if (!test.ok) throw '⚠️ El archivo de video no está disponible o fue bloqueado'

    let caption = `
🎬 *Título:* ${result.title}
👤 *Autor:* ${result.author}
⏱️ *Duración:* ${result.duration}
📆 *Subido:* ${result.uploadDate}
👀 *Vistas:* ${result.views.toLocaleString()}
📥 *Calidad:* ${result.quality}
`.trim()

    await conn.sendMessage(m.chat, {
      video: { url: result.video },
      mimetype: 'video/mp4',
      fileName: result.filename,
      caption: caption
    }, { quoted: m })

  } catch (err) {
    console.error('❌ Error en ytmp4:', err)
    m.reply(typeof err === 'string' ? err : '❌ Error al descargar el video')
  }
}

handler.command = /^ytmp4$/i
handler.help = ['ytmp4 <url>']
handler.tags = ['descargas']
handler.register = false

export default handler