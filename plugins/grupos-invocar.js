const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);

  // Debug: imprimir participantes y roles
  console.log('🔎 Participantes del grupo:');
  groupMetadata.participants.forEach(p => {
    console.log(`- ${p.id} admin: ${p.admin || 'miembro'}`);
  });

  const userParticipant = groupMetadata.participants.find(p => p.id === m.sender);

  console.log('🔎 Info usuario que manda:', userParticipant);

  const isUserAdmin = userParticipant?.admin === 'admin' || userParticipant?.admin === 'superadmin' || m.sender === groupMetadata.owner;

  if (!isUserAdmin) return m.reply('❌ Solo los admins pueden usar este comando.');

  const customEmoji = global.db.data.chats[m.chat]?.customEmoji || '☕';
  m.react(customEmoji);

  const mensaje = args.join` ` || 'Sin mensaje personalizado';
  const total = groupMetadata.participants.length;

  const header = `╭─────────────╮\n│   🗣️ *MENCIÓN GENERAL*  │\n╰─────────────╯\n`;
  const info = `💌 *Mensaje:* ${mensaje}\n👥 *Miembros:* ${total}\n${customEmoji.repeat(1)}\n`;

  let cuerpo = '';
  for (const mem of groupMetadata.participants) {
    cuerpo += `╭ ${customEmoji} @${mem.id.split('@')[0]}\n`;
  }

  const footer = `${customEmoji.repeat(15)}\n┊ 💜 *Bot:* ${global.botname || 'Bot'}\n┊ 📅 *Comando:* ${usedPrefix}${command}\n╰──────────────╯`;

  const texto = [header, info, cuerpo, footer].join('\n');
  conn.sendMessage(m.chat, { text: texto.trim(), mentions: groupMetadata.participants.map(a => a.id) });
};

handler.help = ['invocar *<mensaje opcional>*'];
handler.tags = ['group'];
handler.command = ['todos', 'invocar', 'tagall'];
handler.group = true;

export default handler;