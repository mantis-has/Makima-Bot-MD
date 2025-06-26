// setbotname-subbot.js
import fs from 'fs'
import path from 'path'
import chalk from 'chalk' // Asegúrate de importar chalk si lo usas aquí

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const newName = text.trim()
  if (!newName) {
    return m.reply(`*¡Ingresa el nuevo nombre para el Sub-Bot!* \n\nEjemplo:\n${usedPrefix + command} Yuru Kawaii`)
  }

  // Obtener el JID del bot actual y limpiarlo para usarlo como nombre de carpeta
  const botJid = conn?.user?.id || conn?.auth?.creds?.me?.id?.split(':')[0];
  if (!botJid) {
    return m.reply('❌ No se pudo identificar la sesión de este bot para cambiar el nombre. Asegúrate de que el bot esté conectado.');
  }

  // Asegurarse de que el sessionId sea solo el número (sin @s.whatsapp.net)
  const sessionId = botJid.includes('@') ? botJid.split('@')[0] : botJid;

  // --- CORRECCIÓN CLAVE AQUÍ ---
  // Obtener la ruta del directorio del plugin actual
  const currentPluginDir = path.dirname(new URL(import.meta.url).pathname);
  
  // Subir dos niveles para llegar a la raíz del proyecto (desde plugins/index/nombre.js -> plugins/ -> root/)
  const projectRoot = path.join(currentPluginDir, '..', '..');

  // Construir la ruta a la carpeta de sesión del bot específico
  const sessionDir = path.join(projectRoot, 'JadiBots', sessionId);
  // --- FIN CORRECCIÓN CLAVE ---

  // Verificar si la carpeta de sesión existe
  if (!fs.existsSync(sessionDir)) {
      console.error(chalk.red(`Error: La carpeta de sesión esperada no existe para ${sessionId}: ${sessionDir}`));
      return m.reply('❌ No se encontró la carpeta de sesión para este bot. No se puede guardar la configuración. Revisa la ruta.');
  }

  const configPath = path.join(sessionDir, 'config.json');
  
  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
      console.error(chalk.red(`Error al leer config.json de ${sessionId}:`), e);
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
    console.error(chalk.red(`Error al escribir config.json de ${sessionId}:`), e);
    m.reply('❌ Error al guardar el nuevo nombre del Sub-Bot.');
  }
}

handler.command = /^setbotname$/i
handler.tags = ['owner']
handler.rowner = false
handler.limit = false 

export default handler
