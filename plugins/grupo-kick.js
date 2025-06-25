var handler = async (m, { conn, participants, args }) => {
    if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

    const groupMetadata = await conn.groupMetadata(m.chat);
    const botJid = conn.user.jid;

    // Buscar el ID exacto del bot dentro del grupo
    const botParticipant = participants.find(p => p.id === botJid || p.id.includes(botJid.split('@')[0]));
    console.log('🧠 BotJID:', botJid)
    console.log('🧠 Detectado como:', botParticipant)

    const isBotAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
    if (!isBotAdmin) return m.reply('🧃 No soy admin, no puedo expulsar a nadie.');

    // Verificar si el usuario que usa el comando es admin
    const userParticipant = participants.find(p => p.id === m.sender);
    const isUserAdmin = userParticipant?.admin === 'admin' || userParticipant?.admin === 'superadmin';
    if (!isUserAdmin) return m.reply('❌ Solo los admins pueden usar este comando.');

    // Obtener el user a expulsar
    let user;
    if (m.mentionedJid[0]) {
        user = m.mentionedJid[0];
    } else if (m.quoted) {
        user = m.quoted.sender;
    } else if (args[0]) {
        const number = args[0].replace(/[^0-9]/g, '');
        if (!number) return m.reply('⚠️ Número inválido.');
        user = number + '@s.whatsapp.net';
    } else {
        return m.reply('🚫 Mencioná, respondé o escribí el número a expulsar.');
    }

    const ownerGroup = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net';

    if (user === botJid) return m.reply(`😹 No me puedo sacar a mí mismo`);
    if (user === ownerGroup) return m.reply(`👑 Ese es el dueño del grupo`);
    if (user === ownerBot) return m.reply(`💥 Ese es el dueño del bot`);

    try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
        await m.reply(`✅ Usuario eliminado con éxito.`);
    } catch (e) {
        await m.reply(`❌ No se pudo expulsar: ${e}`);
    }
};

handler.help = ['kick'];
handler.tags = ['group'];
handler.command = ['kick','echar','hechar','sacar','ban'];

export default handler;