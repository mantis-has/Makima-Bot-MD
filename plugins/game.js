import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*🔎 Uso correcto:*\n\n${usedPrefix + command} nombre de la canción`)

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    // Buscar con API de Delirius (suponiendo endpoint que recibe ?q=)
    const searchRes = await fetch(`https://api-delirius.vercel.app/api/ytsearch?q=${encodeURIComponent(text)}`)
    const searchJson = await searchRes.json()

    if (!searchJson?.result || searchJson.result.length === 0) {
      return m.reply('❌ No encontré nada con ese nombre, prueba con otro.')
    }

    // Tomar el primer resultado
    const video = searchJson.result[0]
    const videoUrl = video.url || video.link || `https://youtu.be/${video.videoId}`

    // Descargar video con tu API
    const apiURL = `https://theadonix-api.vercel.app/api/ytmp4?url=${encodeURIComponent(videoUrl)}`
    const apiRes = await fetch(apiURL)
    const apiJson = await apiRes.json()

    if (apiJson?.status !== 200 || !apiJson?.result) {
      return m.reply(`❌ Error al procesar el video\n${apiJson?.mensaje || 'Intenta con otro nombre'}`)
    }

    const { title, video: videoFile, filename, quality, size } = apiJson.result

    await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } })

    await conn.sendFile(m.chat, videoFile, filename, `🎵 *${title}*\n📼 Calidad: ${quality}\n📦 Tamaño aprox: ${size}`, m)

  } catch (e) {
    console.error('[play2]', e)
    m.reply(`❌ Error al buscar o descargar\n\n${e.message}`)
  }
}

handler.help = ['play2 <nombre>']
handler.tags = ['downloader']
handler.command = ['play2']

export default handler