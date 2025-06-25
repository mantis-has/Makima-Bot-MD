var handler = async (m, { conn, participants, args }) => {
    if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

    const groupMetadata = await conn.groupMetadata(m.chat);

    const botNumber = conn.user.jid.split('@')[0]; // número del bot sin @
    const botParticipant = participants.find(p => p.id.startsWith(botNumber));
    const isBotAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';

    if (!isBotAdmin) {
        console.log('[❗] BOT ID NO DETECTADO COMO ADMIN');
        console.log('botNumber:', botNumber);
        console.log('conn.user.jid:', conn.user.jid);
        console.log('botParticipant:', botParticipant);
        return m.reply('🧃 No soy admin, no puedo expulsar a nadie.');
    }

    // Validar si el que mandó el comando es admin
    const senderParticipant = participants.find(p => p.id === m.sender);
    const isSenderAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';

    if (!isSenderAdmin) return m.reply('❌ Solo los admins pueden usar este comando.');

    // Obtener el usuario a expulsar
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
    if (user === ownerGroup) return m.reply(`👑 Ese es el dueño del grupo, no se puede`);
    if (user === ownerBot) return m.reply(`💥 Ese es el dueño del bot, ni lo toqués`);

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