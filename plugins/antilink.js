let linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
let linkRegex1 = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i;

export async function before(m, { conn, isAdmin, isOwner, isROwner }) {
  if (!m.isGroup) return;

  let chat = global.db.data.chats[m.chat] || {};
  if (!chat.antilink) return;

  if (isAdmin || isOwner || m.fromMe || isROwner) return;

  const text = m?.text || '';
  const isGroupLink = linkRegex.test(text) || linkRegex1.test(text);
  if (!isGroupLink) return;

  const userTag = `@${m.sender.split('@')[0]}`;
  const delet = m.key.participant;
  const msgID = m.key.id;

  // Ignora si es el mismo link del grupo
  try {
    const ownGroupLink = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`;
    if (text.includes(ownGroupLink)) return;
  } catch (e) {
    console.error('❌ Error al obtener link del grupo:', e);
  }

  try {
    // Mensaje de aviso
    await conn.sendMessage(m.chat, {
      text: `✦ ${userTag} fue eliminado por enviar un enlace prohibido.`,
      mentions: [m.sender],
      contextInfo: global.rcanal
    }, { quoted: m });

    // Eliminar mensaje
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: msgID,
        participant: delet
      }
    });

    // Expulsar
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');

  } catch (err) {
    console.error('❌ Error al expulsar o borrar:', err);
    await conn.sendMessage(m.chat, {
      text: `⚠️ No pude eliminar ni expulsar a ${userTag}. Puede que no tenga permisos.`,
      mentions: [m.sender]
    }, { quoted: m });
  }

  return !0;
}

// ⏺️ COMANDO PARA ACTIVAR/DESACTIVAR ANTILINK
const commandHandler = async (m, { conn, args, isAdmin, isOwner, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo funciona en grupos.');
  if (!(isAdmin || isOwner)) return m.reply('❌ Solo los admins pueden activar o desactivar el antilink.');

  let chat = global.db.data.chats[m.chat];
  const estado = command === 'on';

  chat.antilink = estado;

  m.reply(`✅ Antilink ${estado ? 'activado' : 'desactivado'} correctamente.`);
};

commandHandler.command = ['on', 'off'];
commandHandler.group = true;
commandHandler.tags = ['group'];
commandHandler.help = ['on antilink', 'off antilink'];

export default commandHandler;