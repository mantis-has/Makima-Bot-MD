import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`✐ Ejemplo de uso:\n.${command} Autobots transformarse y avanzar`)

  try {
    const res = await fetch(`https://zenzxz.dpdns.org/tools/text2speech?text=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (!json.status || !Array.isArray(json.results)) {
      return m.reply('✐ Error al obtener los datos de la API.')
    }

    // Buscar el modelo de Optimus Prime
    const optimus = json.results.find(v => v.model === 'optimus_prime')
    if (!optimus) return m.reply('✦ No se encontró la voz de Optimus Prime.')

    const audioRes = await fetch(optimus.audio_url)
    const audioBuffer = await audioRes.arrayBuffer()

    await conn.sendMessage(m.chat, {
      audio: Buffer.from(audioBuffer),
      mimetype: 'audio/mpeg',
      ptt: true
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('✿ Error al generar la voz, intenta de nuevo más tarde.')
  }
}

handler.help = ['optimus *<texto>*']
handler.tags = ['voz', 'fun']
handler.command = ['tts']
export default handler