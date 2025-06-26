import fetch from 'node-fetch'

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) return m.reply(`🚫 Ingresa el enlace de un post o reel de Instagram.\n\n📌 Ejemplo:\n${usedPrefix + command} https://www.instagram.com/reel/abc123/`)

  try {
    m.react('⏳')
    const res = await fetch(`https://api.dorratz.com/igdl?url=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (!json.data || !json.data.length) throw '🚫 No se pudo obtener el contenido'

    for (let media of json.data) {
      await conn.sendFile(m.chat, media.url, 'igdl.mp4', `✅ Descargado desde Instagram`, m, false, {
        thumbnail: media.thumbnail ? await (await fetch(media.thumbnail)).buffer() : null,
        mimetype: 'video/mp4'
      })
    }

  } catch (e) {
    console.error(e)
    m.reply('⚠️ Ocurrió un error al descargar el video.')
  }
}

handler.help = ['igdl <url>']
handler.tags = ['downloader']
handler.command = ['ig', 'instagram']

export default handler