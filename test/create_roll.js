const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Discord Bot のトークン
const token = '';

// ロールを作成するサーバーの ID
const guildId = '1159887053190864906';

// 作成するロールのリスト
const roles = ['Aグループ', 'Bグループ', 'Cグループ', 'Dグループ', 'Eグループ', 'Fグループ'];

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const guild = client.guilds.cache.get(guildId);
    if (!guild) return console.log('Guild not found');

    // 各ロールを作成
    for (const roleName of roles) {
        try {
        await guild.roles.create({
            name: roleName,
            reason: 'New role creation'
        });
        console.log(`Role created: ${roleName}`);
        } catch (error) {
        console.error(`Error creating role ${roleName}:`, error);
        }
    }
});

client.login(token);