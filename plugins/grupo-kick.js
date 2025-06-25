var handler = async (m, { conn, participants, args }) => {
    if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

    const groupMetadata = await conn.groupMetadata(m.chat);
    
    const botNumber = conn.user.jid.split('@')[0]; // solo número
    let botParticipant = participants.find(p => {
        return p.id.includes(botNumber) || botNumber.includes(p.id.split('@')[0])
    });

    console.log('🔎 BotNumber:', botNumber)
    console.log('🔎 Detectado como:', botParticipant?.id || 'NO DETECTADO')

    const isBotAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
    if (!isBotAdmin) return m.reply('🧃 No soy admin, no puedo expulsar a nadie.');

    // Verificar si el que ejecuta es admin
    const userParticipant = participants.find(p => p.id === m.sender);
    const isUserAdmin = userParticipant?.admin === 'admin' || userParticipant?.admin === 'superadmin';
    if (!isUserAdmin) return m.reply('❌ Solo los admins pueden usar este comando.');

    // Obtener usuario a expulsar
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
        return m.reply('🚫 Mencioná, respondé o escribí un número para expulsar.');
    }

    const ownerGroup = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net';

    if (user === conn.user.jid) return m.reply(`😹 No me puedo sacar a mí mismo`);
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