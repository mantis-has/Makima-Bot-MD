import fetch from 'node-fetch'

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) return m.reply(`*📌 Uso correcto:*\n${usedPrefix + command} https://youtu.be/videoid`)

  await m.react('⏳') // Reacción de espera

  try {
    const res = await fetch(`https://theadonix-api.vercel.app/api/ytmp42?url=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (json.status !== 200) return m.reply(`❌ No se pudo descargar el video`)

    const { title, video, filename, quality } = json.result

    await m.reply(
      `📥 *Descargando...*\n\n` +
      `🎬 *Título:* ${title}\n` +
      `📁 *Archivo:* ${filename}\n` +
      `📹 *Calidad:* ${quality}\n` +
      `🔗 *Enlace:* ${video}`
    )
  } catch (err) {
    console.error(err)
    await m.reply(`❌ Error al procesar el video`)
  }
}

handler.help = ['play2 <url>', 'mp4 <url>']
handler.tags = ['downloader']
handler.command = /^(play2|mp4)$/i

export default handler