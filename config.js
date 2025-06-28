import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'


global.owner = [
  ['18293142989', 'CREADOR', true],
]


global.mods = []
global.prems = []

global.libreria = 'Baileys'
global.baileys = 'V 6.7.16' 
global.vs = '2.2.0'
global.nameqr = 'MAKIMA-BOT-MD'
global.namebot = 'Makima Bot MD'
global.sessions = 'Sessions'
global.jadi = 'JadiBots' 
global.yukiJadibts = true

global.packname = 'MakimaBot'
global.namebot = 'Makima Bot MD'
global.author = 'Made with Félix'


global.namecanal = 'MAKIMA - FRASES'
global.canal = 'https://whatsapp.com/channel/0029VbAZcyIIXnlwp79iwu2l'
global.idcanal = '120363400360651198@newsletter'

global.ch = {
ch1: '120363400360651198@newsletter',
}

global.multiplier = 69 
global.maxwarn = '2'


let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})

