import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) return m.reply(`📌 Ejemplo:\n${usedPrefix + command} Believer\n${usedPrefix + command} https://youtu.be/abc123`)

  await m.react('⏳')

  let url = ''

  // Si es link directo
  if (/(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(text)) {
    url = text
  } else {
    // Buscar usando yt-search
    const search = await yts(text)
    const video = search.videos[0]

    if (!video) return m.reply('❌ No encontré resultados en YouTube')

    url = video.url
  }

  try {
    const res = await fetch(`https://theadonix-api.vercel.app/api/ytmp42?url=${encodeURIComponent(url)}`)
    const json = await res.json()

    if (json.status !== 200) return m.reply(`❌ No se pudo descargar el video`)

    const { title, video, filename, quality } = json.result

    await m.reply(
      `📥 *Descargando...*\n\n` +
      `🎬 *Título:* ${title}\n` +
      `📁 *Archivo:* ${filename}\n` +
      `📹 *Calidad:* ${quality}\n` +
      `🔗 *Link:* ${video}`
    )
  } catch (e) {
    console.error(e)
    await m.reply('❌ Error al procesar el video')
  }
}

handler.help = ['play2 <nombre o url>', 'mp4 <nombre o url>']
handler.tags = ['downloader']
handler.command = /^play2|mp4$/i

export default handler