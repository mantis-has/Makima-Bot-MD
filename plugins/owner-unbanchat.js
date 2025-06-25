let handler = async (m, { conn, isAdmin, isROwner} ) => {
    if (!(isAdmin || isROwner)) return dfail('admin', m, conn)
    global.db.data.chats[m.chat].isBanned = false
    await conn.reply(m.chat, 'ℵ Hola, la interacción de este chat ha sido *Desbaneado* con exito Correctamente.', m, rcanal)
    await m.react('✅')
}
handler.help = ['desbanearbot']
handler.tags = ['owner']
handler.command = ['desbanearbot', 'unbanchat']
handler.rowner = true
export default handler
