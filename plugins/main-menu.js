import fs from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'

const tags = {
  serbot: '❀ Subs - Bots',
  downloader: '❀ Downloaders',
  tools: '❀ Tools',
  owner: '❀ Owner',
  group: '❀ Group',
  search: '❀ Searchs',
  sticker: '❀ Stickers',
}

const defaultMenu = {
  before: `
*✿ Holis, Soy %botname* ¿ Que tal ?
> ❐ Aqui tienes el menu : 

*「✧」ᴀᴅᴏɴɪx ᴀᴘɪ*
https://theadonix-api.vercel.app

%readmore`.trimStart(),
  header: '> *%category*',
  body: '• %cmd %islimit %isPremium\n',
  footer: '',
  after: '',
}

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const { exp, limit, level } = global.db.data.users[m.sender]
    const { min, xp, max } = xpRange(level, global.multiplier)
    const name = await conn.getName(m.sender)

    const d = new Date(Date.now() + 3600000)
    const locale = 'es'
    const week = d.toLocaleDateString(locale, { weekday: 'long' })
    const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    const time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' })

    const uptime = clockString(process.uptime() * 1000)
    const totalreg = Object.keys(global.db.data.users).length
    const rtotalreg = Object.values(global.db.data.users).filter(user => user.registered).length

    const help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => ({
      help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
      tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
      prefix: 'customPrefix' in plugin,
      limit: plugin.limit,
      premium: plugin.premium
    }))

    let nombreBot = global.namebot || 'Bot'

    // Verifica si es subbot o el principal
    const botPrincipal = '+50493059810'
    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const esPrincipal = botActual === botPrincipal.replace(/\D/g, '')
    const tipoBot = esPrincipal ? '*☁︎ Bot:* Principal 🅥' : '*☁︎ Bot:* Sub Bot 🅑'

    const menuConfig = conn.menu || defaultMenu
    const _text = [
      tipoBot,
      menuConfig.before,
      ...Object.keys(tags).map(tag => {
        return [
          menuConfig.header.replace(/%category/g, tags[tag]),
          help.filter(menu => menu.tags?.includes(tag)).map(menu => {
            return menu.help.map(helpText => {
              return menuConfig.body
                .replace(/%cmd/g, menu.prefix ? helpText : `${_p}${helpText}`)
                .replace(/%islimit/g, menu.limit ? '◜⭐◞' : '')
                .replace(/%isPremium/g, menu.premium ? '◜🪪◞' : '')
                .trim()
            }).join('\n')
          }).join('\n'),
          menuConfig.footer,
        ].join('\n')
      }),
      menuConfig.after
    ].join('\n')

    const replace = {
      '%': '%',
      p: _p,
      botname: nombreBot,
      taguser: '@' + m.sender.split('@')[0],
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp,
      level,
      limit,
      name,
      week,
      date,
      time,
      totalreg,
      rtotalreg,
      readmore: readMore,
      greeting,
    }

    let text = _text.replace(
      new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
      (_, name) => String(replace[name])
    )

    await conn.sendMessage(
      m.chat,
      {
        image: fs.readFileSync('./storage/img/menu.jpg'),
        caption: text.trim(),
        contextInfo: {
          mentionedJid: conn.parseMention(text),
          isForwarded: true
        }
      },
      { quoted: m }
    )

  } catch (e) {
    conn.reply(m.chat, '❎ Lo sentimos, el menú tiene un error.', m)
    console.error('❌ Error en el menú:', e)
  }
}

handler.command = ['menu', 'help', 'menú']
export default handler

// Utilidades
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

const ase = new Date()
let hour = ase.getHours()
const greetingMap = {
  0: 'una linda noche 🌙',
  1: 'una linda noche 💤',
  2: 'una linda noche 🦉',
  3: 'una linda mañana ✨',
  4: 'una linda mañana 💫',
  5: 'una linda mañana 🌅',
  6: 'una linda mañana 🌄',
  7: 'una linda mañana 🌅',
  8: 'una linda mañana 💫',
  9: 'una linda mañana ✨',
  10: 'un lindo día 🌞',
  11: 'un lindo día 🌨',
  12: 'un lindo día ❄',
  13: 'un lindo día 🌤',
  14: 'una linda tarde 🌇',
  15: 'una linda tarde 🥀',
  16: 'una linda tarde 🌹',
  17: 'una linda tarde 🌆',
  18: 'una linda noche 🌙',
  19: 'una linda noche 🌃',
  20: 'una linda noche 🌌',
  21: 'una linda noche 🌃',
  22: 'una linda noche 🌙',
  23: 'una linda noche 🌃',
}

var greeting = 'espero que tengas ' + (greetingMap[hour] || 'un buen día')