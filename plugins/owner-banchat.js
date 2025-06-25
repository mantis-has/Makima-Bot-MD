let handler = async (m, { conn, isAdmin, isROwner }) => {
    if (!(isAdmin || isROwner)) return dfail('admin', m, conn)
    global.db.data.chats[m.chat].isBanned = true
    await conn.reply(m.chat, `ℵ Hola, la interacción de este chat ha sido *Baneado* con exito Correctamente.`, m, rcanal)
    await m.react('✅')
}
handler.help = ['banearbot']
handler.tags = ['owner']
handler.command = ['banearbot', 'banchat']
handler.rowner = true
export default handler
