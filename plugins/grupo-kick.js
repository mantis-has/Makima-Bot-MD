var handler = async (m, { conn, args }) => {
    if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

    const groupMetadata = await conn.groupMetadata(m.chat);

    console.log('🔎 Participantes del grupo:');
    groupMetadata.participants.forEach(p => {
        console.log(`- ${p.id} admin: ${p.admin || 'miembro'}`);
    });

    const userParticipant = groupMetadata.participants.find(p => p.id === m.sender);

    console.log('🔎 Info usuario que manda:', userParticipant);

    const isUserAdmin = userParticipant?.admin === 'admin' || userParticipant?.admin === 'superadmin';

    if (!isUserAdmin) {
        return m.reply('❌ Solo los admins pueden usar este comando.');
    }

    // Aquí sigue tu lógica para expulsar...
};