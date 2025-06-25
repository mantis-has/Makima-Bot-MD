import fetch from 'node-fetch'
import yts from 'yt-search'
import { yta, ytv } from './_dl.js'

const dev = 'Ado'
const limitMB = 100
const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text?.trim()) return conn.reply(m.chat, '❀ Por favor, ingresa el nombre o link de YouTube.', m)

    let videoIdMatch = text.match(youtubeRegexID)
    let ytsearch = await yts(videoIdMatch ? 'https://youtu.be/' + videoIdMatch[1] : text)

    let video = null
    if (videoIdMatch) {
      const videoId = videoIdMatch[1]
      video = ytsearch.all?.find(v => v.videoId === videoId) || ytsearch.videos?.find(v => v.videoId === videoId)
    }
    video = video || ytsearch.all?.[0] || ytsearch.videos?.[0]

    if (!video || typeof video !== 'object') return conn.reply(m.chat, '✧ No se encontraron resultados válidos.', m)

    let { title, thumbnail, timestamp, views, ago, url, author } = video
    title = title || 'Sin título'
    thumbnail = (thumbnail && thumbnail.startsWith('http')) ? thumbnail : null
    timestamp = timestamp || 'Desconocido'
    views = formatViews(views)
    ago = ago || 'Desconocido'
    url = url || 'Desconocido'
    const canal = author?.name || 'Desconocido'

    let thumb = null
    if (thumbnail) {
      try {
        thumb = (await conn.getFile(thumbnail)).data
      } catch (e) {
        thumb = null
      }
    }

    const info = `*「✦」Descargando: ${title}*\n\n` +
                 `❀ *Canal:* ${canal}\n` +
                 `✰ *Vistas:* ${views}\n` +
                 `ⴵ *Duración:* ${timestamp}\n` +
                 `✐ *Publicado:* ${ago}\n` +
                 `🜸 *Link:* ${url}`

    const contexto = {
      contextInfo: {
        externalAdReply: {
          title: namebot,
          body: dev,
          mediaType: 1,
          previewType: 0,
          mediaUrl: url,
          sourceUrl: url,
          thumbnail: thumb,
          renderLargerThumbnail: true,
        }
      }
    }

    await conn.reply(m.chat, info, m, contexto)

    if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
      const api = await yta(url)
      const result = api?.result?.download
      if (!result) throw new Error('❌ Enlace de descarga de audio no disponible.')
      await conn.sendMessage(m.chat, {
        audio: { url: result },
        fileName: `${(api.result.title || title)}.mp3`,
        mimetype: 'audio/mpeg'
      }, { quoted: m })
    }

    if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
      const api = await ytv(url)
      const result = api?.url
      if (!result) throw new Error('❌ Enlace de descarga de video no disponible.')

      let sizeMB = 0
      try {
        const head = await fetch(result, { method: 'HEAD' })
        const length = head.headers.get('content-length')
        if (length) sizeMB = parseInt(length) / (1024 * 1024)
      } catch (e) {
        console.log('⚠ No se pudo obtener el tamaño:', e.message)
      }

      if (sizeMB > limitMB && sizeMB > 0) {
        return conn.reply(m.chat, `🚫 El archivo es muy pesado (${sizeMB.toFixed(2)} MB). El límite es ${limitMB} MB.`, m)
      }

      await conn.sendFile(m.chat, result, `${(api.title || title)}.mp4`, title, m)
    }

  } catch (e) {
    console.error('❌ Error general:', e)
    return conn.reply(m.chat, `⚠︎ Ocurrió un error:\n\n${e.message}`, m)
  }
}

handler.command = handler.help = ['play', 'yta', 'ytmp3', 'play2', 'ytv', 'ytmp4', 'playaudio', 'mp4']
handler.tags = ['descargas']
handler.group = false // o true si lo querés solo para grupos

export default handler

function formatViews(views) {
  if (!views || views === 'Desconocido') return 'Desconocido'
  if (typeof views === 'string') return views
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`
  return views.toString()
}