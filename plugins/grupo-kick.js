var handler = async (m, { conn, participants, args }) => {
    if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

    const groupMetadata = await conn.groupMetadata(m.chat);
    const groupAdmins = participants.filter(p => p.admin).map(p => p.id);

    const botID = conn.user.jid;
    const senderID = m.sender;

    // Validar si el bot es admin
    const isBotAdmin = groupAdmins.includes(botID);
    if (!isBotAdmin) return m.reply('🧃 No soy admin, no puedo expulsar a nadie.');

    // Validar si el que ejecuta es admin
    const isUserAdmin = groupAdmins.includes(senderID);
    if (!isUserAdmin) return m.reply('❌ Solo los admins pueden usar este comando.');

    // Obtener el usuario a expulsar
    let user;
    if (m.mentionedJid.length > 0) {
        user = m.mentionedJid[0]; // Puede ser s.whatsapp.net o lid
    } else if (m.quoted) {
        user = m.quoted.sender; // Igual puede ser lid
    } else if (args[0]) {
        const number = args[0].replace(/[@+]/g, '');
        if (!number.match(/^\d{7,20}$/)) return m.reply('⚠️ El número no es válido.');
        user = number + '@s.whatsapp.net';
    } else {
        return m.reply('🚫 Mencioná, respondé o escribí el número con @ para expulsar.');
    }

    const ownerGroup = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net';

    // Verificaciones
    if (user === botID) return m.reply(`😹 No me puedo sacar a mí mismo`);
    if (user === ownerGroup) return m.reply(`👑 Ese es el dueño del grupo, no se puede`);
    if (user === ownerBot) return m.reply(`💥 Ese es el dueño del bot, ni lo toqués`);

    // Ejecutar la expulsión
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        .then(() => m.reply(`✅ Usuario eliminado con éxito: ${user.replace(/@.+/, '')}`))
        .catch(err => m.reply(`❌ No se pudo expulsar: ${err}`));
};

handler.help = ['kick'];
handler.tags = ['group'];
handler.command = ['kick','echar','hechar','sacar','ban'];

export default handler;