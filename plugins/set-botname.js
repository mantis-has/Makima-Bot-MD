// setbotname-subbot.js
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const newName = text.trim()
  if (!newName) {
    return m.reply(`*¡Ingresa el nuevo nombre para el Sub-Bot!* \n\nEjemplo:\n${usedPrefix + command} Yuru Kawaii`)
  }

  // Obtiene la ruta base del JID del bot actual
  // Esto debería ser el número de teléfono del bot
  const botJid = conn?.user?.id || conn?.auth?.creds?.me?.id?.split(':')[0];
  if (!botJid) {
    return m.reply('❌ No se pudo identificar la sesión de este bot para cambiar el nombre. Asegúrate de que el bot esté conectado.');
  }

  // Asegúrate de obtener solo los números del JID para el nombre de la carpeta
  const sessionId = botJid.includes('@') ? botJid.split('@')[0] : botJid;

  // Construye la ruta a la carpeta de sesión del bot que está ejecutando el comando.
  // Usamos global.__dirname que apunta a la raíz del proyecto.
  const sessionDir = path.join(global.__dirname(import.meta.url), 'JadiBots', sessionId);

  // Asegúrate de que la carpeta de sesión exista
  if (!fs.existsSync(sessionDir)) {
      console.error(`Error: La carpeta de sesión esperada no existe: ${sessionDir}`);
      return m.reply('❌ No se encontró la carpeta de sesión para este bot. No se puede guardar la configuración.');
  }

  const configPath = path.join(sessionDir, 'config.json');
  
  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
      console.error(`Error al leer config.json de ${sessionId}:`, e);
      m.reply('❌ Error al cargar la configuración existente del Sub-Bot. El archivo puede estar corrupto.');
      return;
    }
  }

  config.namebot = newName;
  
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    m.reply(`✅ Nombre del Sub-Bot actualizado a: *${newName}*`);
    console.log(chalk.green(`Nombre del Sub-Bot ${sessionId} actualizado a: ${newName}`));
  } catch (e) {
    console.error(`Error al escribir config.json de ${sessionId}:`, e);
    m.reply('❌ Error al guardar el nuevo nombre del Sub-Bot.');
  }
}

handler.command = /^setbotname$/i
handler.tags = ['owner'] 
handler.rowner = false
handler.limit = false 

export default handler
