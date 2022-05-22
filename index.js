const mineflayer = require('mineflayer')
const config = require("./config.json");
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder');
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const bot = mineflayer.createBot({
    host: config.ip,
    username: config.username,
    password: config.password,
    port: config.port,
    auth: config.auth
})
const targetUser = config.target
bot.loadPlugin(pathfinder)
bot.on('login', () => {
    console.log(`Logged in as ${bot.username}`)
})
bot.once('spawn', () => {
    console.log(`Spawned in at ${bot.entity.position}`)
    mineflayerViewer(bot, { port: config.viewerPort, firstPerson: true })
    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)
    setInterval(() => {
        const target = bot.players[targetUser]?.entity
        if (!target) {
            console.log(`Failed to find ${targetUser}`)
            return
        }
        const { x: playerX, y: playerY, z: playerZ } = target.position
        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, 2))
    }, 500)
    setInterval(() => {
        bot.swingArm('left')
    }, 15000)
})
bot.on('whisper', (username) => {
    if (username === targetUser) {
        console.log(`Process ended by ${targetUser}`)
        process.exit()
    }
  })
bot.on('entityHurt', (entity) => {
    if (entity === bot.entity) {
        if (bot.health<config.autolog) {
            console.log(`Quit at ${config.autolog} health`)
            process.exit()
        }
    }
})
bot.on('kicked', console.log)
bot.on('error', console.log)
