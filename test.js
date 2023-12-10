const fs = require('fs');
const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const token = ''; // Discord Bot のトークン

const Streamer_roll = ['1159887614711697508', '1160597494942683266']; // 配信者とゲスト配信者のロールID
const Listener_roll = '1159911738955812866'; // 視聴者のロールID
const Verified_roll = '1159911194006659173'; // Yunite認証済みのロールID

const listen_ch = '1159910468605972632';
const command_ch = '1182270241296896050';

const roles = {
    'Aグループ': '1174761485059227722',
    'Bグループ': '1174761486514671638',
    'Cグループ': '1174761488066555985',

};

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.channel.id !== command_ch) return;
    if (message.content !== '!list') return;

    const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
    data.teams.sort((a, b) => b.totalPoints - a.totalPoints);

    const groupAssignments = {};
    for (const team of data.teams) {
        const index = data.teams.indexOf(team);
        const groupName = Object.keys(roles)[index % Object.keys(roles).length];
        if (!groupAssignments[groupName]) {
            groupAssignments[groupName] = [];
        }
        const role = message.guild.roles.cache.get(team.teamRole);
        const roleName = role ? role.name : `不明なロール: ID ${team.teamRole}`;
        groupAssignments[groupName].push({ roleName, totalPoints: team.totalPoints });
    }

    for (const [group, teams] of Object.entries(groupAssignments)) {
        let responseMessage = `\n\n**${group}グループに属するチーム：(${teams.length}チーム)**\n\n`;
        for (const { roleName, totalPoints } of teams) {
            const teamMessage = `- ${roleName} (ポイント: ${totalPoints})\n`;

            if (responseMessage.length + teamMessage.length > 2000) {
                // 現在のメッセージを送信して、新しいメッセージを開始
                await message.channel.send(responseMessage);
                responseMessage = `${group}グループに属するチーム（続き）：\n`;
            }

            responseMessage += teamMessage;
        }

        // 残りのメッセージを送信
        if (responseMessage.length > 0) {
            await message.channel.send(responseMessage);
        }
    }
});

client.login(token);