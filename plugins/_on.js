import fetch from 'node-fetch';

let linkRegex = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}/i;
let linkRegex1 = /whatsapp\.com\/channel\/[0-9A-Za-z]{20,24}/i;

const defaultImage = 'https://qu.ax/eOCUt.jpg';

async function isAdminOrOwner(m, conn) {
  try {
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participant = groupMetadata.participants.find(p => p.id === m.sender);
    return participant?.admin === 'admin' || participant?.admin === 'superadmin' || m.fromMe;
  } catch {
    return false;
  }
}

const handler = async (m, { conn, command, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 Solo funciona en grupos.');

  const chat = global.db.data.chats[m.chat] ||= {};
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
handler.help = ['on welcome', 'off welcome', 'on antilink', 'off antilink'];

handler.before = async (m, { conn }) => {
  if (!m.isGroup) return;
  const chat = global.db.data.chats[m.chat] ||= {};

  // ANTI LINK
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
            delete: {
              remoteJid: m.chat,
              fromMe: false,
              id: msgID,
              participant: delet
            }
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

  // WELCOME / BYE
  if (chat.welcome) {
    const groupMetadata = await conn.groupMetadata(m.chat);
    const groupSize = groupMetadata.participants.length;
    const userMention = `@${m.messageStubParameters?.[0]?.split('@')[0] || m.sender.split('@')[0]}`;
    let profilePic;

    try {
      profilePic = await conn.profilePictureUrl(m.messageStubParameters?.[0] || m.sender, 'image');
    } catch {
      profilePic = defaultImage;
    }

    if (m.messageStubType === 27) { // Entrada
      const txtWelcome = '🌸 𝙱𝙸𝙴𝙽𝚅𝙴𝙽𝙸𝙳@ 🌸';
      const bienvenida = `
✿ *Bienvenid@* a *${groupMetadata.subject}* 🌺

✰ ${userMention} ¡qué gusto verte por aquí!

✦ Ahora somos *${groupSize}* integrantes activos 🧑‍🤝‍🧑

🐾 Disfruta y participa, este grupo es pa’ compartir y pasarla bien.

> Usa *#help* para conocer todos los comandos disponibles 👾
      `.trim();

      await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption: `${txtWelcome}\n\n${bienvenida}`,
        contextInfo: { mentionedJid: [userMention.replace('@', '') + '@s.whatsapp.net'] }
      });
    }

    if (m.messageStubType === 28 || m.messageStubType === 32) { // Salida
      const txtBye = '🌸 𝙰𝙳𝙸Ó𝚂 🌸';
      const despedida = `
✿ *Adiós* de *${groupMetadata.subject}* 🥀

✰ ${userMention} esperamos verte pronto de nuevo ✨

✦ Somos *${groupSize}* aún, cuidemos este espacio.

💌 Que tengas un excelente día, nos vemos en otra ocasión.

> Usa *#help* si necesitas algo o quieres volver 🙌
      `.trim();

      await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption: `${txtBye}\n\n${despedida}`,
        contextInfo: { mentionedJid: [userMention.replace('@', '') + '@s.whatsapp.net'] }
      });
    }
  }
};

export default handler;