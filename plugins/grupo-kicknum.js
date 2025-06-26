const handler = async (m, { conn, args, groupMetadata, participants, usedPrefix, command }) => {
  const emoji = '📌'
  const emoji2 = '⚠️'

  if (!args[0]) return conn.reply(m.chat, `${emoji} Ingresa algún prefijo de país para usar el comando.\nEjemplo: *${usedPrefix + command} 54*`, m);
  if (isNaN(args[0])) return conn.reply(m.chat, `${emoji2} El prefijo debe ser un número.\nEjemplo: *${usedPrefix + command} 54*`, m);

  const prefijo = args[0].replace(/[+]/g, '');
  const numerosGrupo = participants.map(p => p.id).filter(id => id.startsWith(prefijo) && id !== conn.user.jid);

  if (!numerosGrupo.length) return m.reply(`${emoji2} No hay ningún número en el grupo con el prefijo +${prefijo}`);

  const delay = ms => new Promise(res => setTimeout(res, ms));

  switch (command) {
    case 'listnum':
    case 'listanum':
      const lista = numerosGrupo.map(n => '⭔ @' + n.split('@')[0]).join('\n');
      await conn.reply(m.chat, `${emoji} Números con el prefijo +${prefijo}:\n\n${lista}`, m, { mentions: numerosGrupo });
      break;

    case 'kicknum':
      await conn.reply(m.chat, `♻️ Iniciando expulsión de usuarios con +${prefijo}...`, m);

      for (const user of numerosGrupo) {
        await delay(2000);

        try {
          const res = await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
          if (res?.[0]?.status === '404') {
            m.reply(`⚠️ @${user.split('@')[0]} ya fue eliminado o salió.`, m.chat, { mentions: [user] });
          }
        } catch (e) {
          m.reply(`❌ No pude expulsar a @${user.split('@')[0]}. Puede que no tenga permisos de admin.`, m.chat, {
            mentions: [user]
          });
        }

        await delay(3000);
      }
      break;
  }
};

handler.command = ['kicknum', 'listnum', 'listanum'];
handler.group = true;
handler.fail = null;

export default handler;