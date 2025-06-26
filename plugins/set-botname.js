// setbotname-subbot.js
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const newName = text.trim()
  if (!newName) {
    return m.reply(`*¡Ingresa el nuevo nombre para el Sub-Bot!* \n\nEjemplo:\n${usedPrefix + command} Yuru Kawaii`)
  }

  // Obtiene la ruta base de la sesión del bot actual (ya sea principal o sub-bot)
  // `conn.auth.creds.me.id` te da el JID del bot, lo cual es útil para identificar la sesión.
  // Tu estructura de carpetas de sesión es 'JadiBots/<numero>/'.
  // Para un sub-bot, conn.auth.creds.me.id.split(':')[0] debería ser su número.
  const sessionId = conn?.auth?.creds?.me?.id?.split(':')[0]; // Esto debería darte el número del bot
  if (!sessionId) {
    return m.reply('❌ No se pudo identificar la sesión de este bot para cambiar el nombre. Asegúrate de que el bot esté conectado.');
  }

  // Construye la ruta a la carpeta de sesión del bot que está ejecutando el comando
  // Asumiendo que las sesiones de sub-bots están en 'JadiBots/<numero>/'
  const sessionDir = path.join(__dirname, '..', 'JadiBots', sessionId);

  // Asegúrate de que la carpeta de sesión exista
  if (!fs.existsSync(sessionDir)) {
      return m.reply('❌ No se encontró la carpeta de sesión para este bot. No se puede guardar la configuración.');
  }

  const configPath = path.join(sessionDir, 'config.json');
  
  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
      console.error(`Error al leer config.json de ${sessionId}:`, e);
      m.reply('❌ Error al cargar la configuración existente del Sub-Bot.');
      return;
    }
  }

  config.namebot = newName;
  
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    m.reply(`✅ Nombre del Sub-Bot actualizado a: *${newName}*`);
  } catch (e) {
    console.error(`Error al escribir config.json de ${sessionId}:`, e);
    m.reply('❌ Error al guardar el nuevo nombre del Sub-Bot.');
  }
}

handler.command = /^setbotname$/i
handler.tags = ['owner'] // Puedes ajustar los tags o categorías si tienes un sistema de ayuda
handler.rowner = false // Solo el owner principal o los dueños de los sub-bots deberían poder usarlo. Ajusta según tu framework.
handler.limit = false // No consume límites, es un ajuste de configuración

export default handler
