const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command, usedPrefix }) => {
  if (usedPrefix == 'a' || usedPrefix == 'A') return;

  const customEmoji = global.db.data.chats[m.chat]?.customEmoji || '☕';
  m.react(customEmoji);

  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }

  const pesan = args.join` ` || 'Sin mensaje personalizado';
  const total = participants.length;

  const header = `╭─────────────╮\n│   🗣️ *MENCIÓN GENERAL*  │\n╰─────────────╯\n`;
  const info = `💌 *Mensaje:* ${pesan}\n👥 *Miembros:* ${total}\n${customEmoji.repeat(15)}\n`;
  let cuerpo = '';
  for (const mem of participants) {
    cuerpo += `╭ ${customEmoji} @${mem.id.split('@')[0]}\n`;
  }

  const footer = `${customEmoji.repeat(15)}\n┊ 💜 *Bot:* ${botname}\n┊ 📅 *Comando:* ${usedPrefix}${command}\n╰──────────────╯`;

  const teks = [header, info, cuerpo, footer].join('\n');
  conn.sendMessage(m.chat, { text: teks.trim(), mentions: participants.map(a => a.id) });
};

handler.help = ['invocar *<mensaje opcional>*'];
handler.tags = ['group'];
handler.command = ['todos', 'invocar', 'tagall'];
handler.admin = true;
handler.group = true;

export default handler;