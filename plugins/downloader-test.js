let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*🌐 Ejemplo de uso:*\n\n${usedPrefix + command} https://youtu.be/aBfUFr9SBY0`)

  const api = `https://theadonix-api.vercel.app/api/ytmp42?url=${encodeURIComponent(text)}`

  try {
    const res = await fetch(api)
    const json = await res.json()

    if (json?.status !== 200) {
      return m.reply(`❌ Error al procesar el video\n${json?.mensaje || 'Inténtalo con otro link'}`)
    }

    const { title, video, filename, quality, size } = json.result

    await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } })

    await conn.sendFile(m.chat, video, filename, `📹 *${title}*\n🎞️ Calidad: ${quality}\n📦 Tamaño aprox: ${size}\n\n📽️`, m)

  } catch (e) {
    console.error('[ytmp42]', e)
    m.reply(`❌ Error al conectar con la API\n\n${e.message}`)
  }
}

handler.help = ['ytmp42 <url>']
handler.tags = ['downloader']
handler.command = /^ytmp42$/i

export default handler