let linkRegex = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}/i;
let linkRegex1 = /whatsapp\.com\/channel\/[0-9A-Za-z]{20,24}/i;

const handler = async (m, { conn, command, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 Solo funciona en grupos.');

  const chat = global.db.data.chats[m.chat] || {};
  const type = (args[0] || '').toLowerCase();

  if (!['antilink', 'welcome'].includes(type)) {
    return m.reply(`✳️ Usa:\n*.on antilink* / *.off antilink*\n*.on welcome* / *.off welcome*`);
  }

  const enable = command === 'on';

  if (type === 'antilink') {
    if (!(isAdmin || isOwner)) return m.reply('❌ Solo admins pueden activar o desactivar Antilink.');
    chat.antilink = enable;
    return m.reply(`✅ Antilink ${enable ? 'activado' : 'desactivado'}.`);
  }

  if (type === 'welcome') {
    if (!(isAdmin || isOwner)) return m.reply('❌ Solo admins pueden activar o desactivar Welcome.');
    chat.welcome = enable;
    return m.reply(`✅ Welcome ${enable ? 'activado' : 'desactivado'}.`);
  }
};

handler.command = ['on', 'off'];
handler.group = true;
handler.tags = ['group'];
handler.help = ['on antilink', 'off antilink', 'on welcome', 'off welcome'];

handler.before = async (m, { conn }) => {
  if (!m.isGroup) return;
  const chat = global.db.data.chats[m.chat] || {};

  // Antilink
  if (chat.antilink) {
    if (!(await isAdminOrOwner(m, conn))) {
      const text = m?.text || '';
      if (linkRegex.test(text) || linkRegex1.test(text)) {
        const userTag = `@${m.sender.split('@')[0]}`;
        const delet = m.key.participant;
        const msgID = m.key.id;
        try {
          const ownGroupLink = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`;
          if (text.includes(ownGroupLink)) return;
        } catch {}

        try {
          await conn.sendMessage(m.chat, {
            text: `🚫 Hey ${userTag}, los enlaces no están permitidos acá. Chau w`,
            mentions: [m.sender]
          }, { quoted: m });
          await conn.sendMessage(m.chat, {
            delete: { remoteJid: m.chat, fromMe: false, id: msgID, participant: delet }
          });
          await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
        } catch {
          await conn.sendMessage(m.chat, {
            text: `⚠️ No pude eliminar ni expulsar a ${userTag}. Puede que no tenga permisos.`,
            mentions: [m.sender]
          }, { quoted: m });
        }
        return true;
      }
    }
  }

  // Welcome y Bye
  if (chat.welcome) {
    if (m.messageStubType === 27) {
      const groupMetadata = await conn.groupMetadata(m.chat);
      const groupSize = groupMetadata.participants.length;
      const userMention = `@${m.sender.split('@')[0]}`;
      const txtWelcome = '🌸 𝑩𝑰𝑬𝑵𝑽𝑬𝑵𝑰𝑫@ 🌸';
      let bienvenida = `
✿ Bienvenid@ a ${groupMetadata.subject} 🌺
✰ ${userMention}
${global.welcom1 || ''}

✦ Ahora somos ${groupSize} miembros
•(=^･ω･^=)• ¡Disfruta tu estadía en el grupo!

> ✧ Usa #help para ver los comandos disponibles
      `.trim();
      await conn.sendMessage(m.chat, { text: `${txtWelcome}\n\n${bienvenida}`, mentions: [m.sender] });
    }
    if (m.messageStubType === 28 || m.messageStubType === 32) {
      const groupMetadata = await conn.groupMetadata(m.chat);
      const groupSize = groupMetadata.participants.length;
      const userMention = `@${m.sender.split('@')[0]}`;
      const txtBye = '🌸 𝑯𝑨𝑺𝑻𝑨 𝑳𝑼𝑬𝑮𝑶 🌸';
      let despedida = `
✿ Adiós de ${groupMetadata.subject} 🥀
✰ ${userMention}
${global.welcom2 || ''}

✦ Ahora somos ${groupSize} miembros
•(=；ω；=)• ¡Te esperamos pronto de vuelta!

> ✧ Usa #help si necesitas ayuda 🫶
      `.trim();
      await conn.sendMessage(m.chat, { text: `${txtBye}\n\n${despedida}`, mentions: [m.sender] });
    }
  }
};

async function isAdminOrOwner(m, conn) {
  try {
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participant = groupMetadata.participants.find(p => p.id === m.sender);
    if (!participant) return false;
    return ['admin', 'superadmin'].includes(participant.admin) || m.fromMe;
  } catch {
    return false;
  }
}

export default handler;