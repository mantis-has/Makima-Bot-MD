import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text, args }) => {
  if (!text) return conn.reply(m.chat, `𖧊 Hola, necesito que me proporciones el nombre del video *Youtube* que deseas Buscar.`, m, rcanal)

  await m.react('🕓')
  let img = `./storage/img/menu.jpg`

  try {
    // Usamos una API de búsqueda de YouTube (puedes cambiarla si tienes otra)
    const { data } = await axios.get(`https://api.starlights.uk/api/search/youtube?q=q=${encodeURIComponent(text)}`)

    const results = data?.result || []

    if (results.length > 0) {
      let txt = `「 *• Searchs* 」`

      for (let i = 0; i < (results.length >= 15 ? 15 : results.length); i++) {
        const video = results[i]
        txt += `\n\n`
        txt += `*◦Nro →* ${i + 1}\n`
        txt += `*◦Título →* ${video.title || 'Sin título'}\n`
        txt += `*◦Duración →* ${video.duration || 'Desconocida'}\n`
        txt += `*◦Canal →* ${video.uploader || 'Desconocido'}\n`
        txt += `*◦Url →* ${video.link}`
      }

      await conn.sendFile(m.chat, img, 'youtube-thumbnail.jpg', txt, m, null, rcanal)
      await m.react('✅')
    } else {
      await conn.react('✖️')
    }
  } catch {
    await m.react('✖️')
  }
}

handler.tags = ['search']
handler.help = ['yts']
handler.command = ['youtubesearch', 'youtubes', 'yts']

export default handler
