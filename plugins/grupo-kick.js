var handler = async (m, { conn, participants, command }) => {
    // Verificar si se ejecuta en grupo
    if (!m.isGroup) return m.reply('🔒 Este comando solo se puede usar en grupos.');

    const groupMetadata = await conn.groupMetadata(m.chat);
    const groupAdmins = participants.filter(p => p.admin).map(p => p.id);

    const botID = conn.user.jid;
    const senderID = m.sender;

    // Validar si el bot es admin
    const isBotAdmin = groupAdmins.includes(botID);
    if (!isBotAdmin) return m.reply('🧃 No soy admin, no puedo expulsar a nadie.');

    // Validar si el que manda el comando es admin
    const isUserAdmin = groupAdmins.includes(senderID);
    if (!isUserAdmin) return m.reply('❌ Solo los admins pueden usar este comando.');

    // Verificar si hay mención o respuesta a mensaje
    if (!m.mentionedJid[0] && !m.quoted) {
        return conn.reply(m.chat, `🚫 Mencioná o respondé al usuario que querés expulsar.`, m);
    }

    // Obtener el usuario a expulsar
    let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;

    // Dueño del grupo y dueño del bot
    const ownerGroup = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net';

    // Verificaciones importantes
    if (user === botID) return conn.reply(m.chat, `😹 No me puedo sacar a mí mismo`, m);
    if (user === ownerGroup) return conn.reply(m.chat, `👑 Ese es el dueño del grupo, no se puede`, m);
    if (user === ownerBot) return conn.reply(m.chat, `💥 Ese es el dueño del bot, ni lo toqués`, m);

    // Ejecutar la expulsión
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        .then(() => m.reply(`🧹 Usuario eliminado con éxito.`))
        .catch(err => m.reply(`❌ Error al expulsar: ${err}`));
};

handler.help = ['kick'];
handler.tags = ['group'];
handler.command = ['kick','echar','hechar','sacar','ban'];

export default handler;