let linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
let linkRegex1 = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i;

export async function before(m, { conn, isAdmin, isOwner, isROwner, participants }) {
  if (!m.isGroup) return;

  let chat = global.db.data.chats[m.chat];
  if (!chat.antilink) return;

  // Ignorar si lo envía un admin o dueño
  if (isAdmin || isOwner || m.fromMe || isROwner) return;

  const text = m?.text || '';
  const isGroupLink = linkRegex.test(text) || linkRegex1.test(text);
  if (!isGroupLink) return;

  const userTag = `@${m.sender.split('@')[0]}`;
  const delet = m.key.participant;
  const msgID = m.key.id;

  // Ignora si es el link del mismo grupo (por seguridad)
  try {
    const ownGroupLink = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`;
    if (text.includes(ownGroupLink)) return;
  } catch (e) {
    console.error('❌ Error al obtener el link del grupo:', e);
  }

  // Intenta eliminar y expulsar, sin validar si el bot es admin
  try {
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

    // Expulsar usuario
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');

  } catch (err) {
    console.error('❌ Error al expulsar o borrar:', err);
    await conn.sendMessage(m.chat, {
      text: `⚠️ No pude eliminar el mensaje ni expulsar a ${userTag}. Puede que no tenga permisos o no soy admin.`,
      mentions: [m.sender]
    }, { quoted: m });
  }

  return !0;
}