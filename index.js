const fs = require('fs');
const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const token = ''; // Discord Bot のトークン

const Streamer_roll = ['1159887614711697508', '1160597494942683266']; // 配信者とゲスト配信者のロールID
const Listener_roll = '1159911738955812866'; // 視聴者のロールID
const Verified_roll = '1159911194006659173'; // Yunite認証済みのロールID

const listen_ch = '1159910468605972632';
const command_ch = '1182270241296896050';

const PR_list = {
    'PR 1～50': 600,
    'PR 51～100': 580,
    'PR 101～150': 560,
    'PR 151～200': 540,
    'PR 201～250': 520,
    'PR 251～300': 500,
    'PR 301～350': 480,
    'PR 351～400': 460,
    'PR 401～450': 440,
    'PR 451～500': 420,
    'PR 501～750': 400,
    'PR 751～1000': 380,
    'PR 1001～1250': 360,
    'PR 1251～1500': 340,
    'PR 1501～1750': 320,
    'PR 1751～2000': 300,
    'PR 2001～2250': 280,
    'PR 2251～2500': 260,
    'PR 2501～3000': 240,
    'PR 3001～3500': 220,
    'PR 3501～4000': 200,
    'PR 4001～4500': 180,
    'PR 4501～5000': 160,
    'PR 5001～6000': 140,
    'PR 6001～7000': 120,
    'PR 7001～8000': 100,
    'PR 8001～9000': 80,
    'PR 9001～10000': 60,
    'PR 10001～15000': 40,
    'PR 15001～20000': 20,
    'PR 20001～30000': 10,
    'PR 30001～50000': 5,
    'PR 50001～': 1
};
// PR_listをmap化
const PR_map = new Map(Object.entries(PR_list));

const roles = {
    'Aグループ': '1182717556834975796',
    'Bグループ': '1182717596039123004',
    'Cグループ': '1182717641165643826'
};


client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.channel.id !== listen_ch) return; // エントリーチャンネルのみ反応

    try{
        const extractedUserIds = message.content.match(/\b\d{17,19}\b/g) || [];
        const mentionedUserIds = message.mentions.users.map(user => user.id);
        const set_uniqueUserIds = new Set([...mentionedUserIds, ...extractedUserIds]);

        if (set_uniqueUserIds.size !== 2) return;
    
        const uniqueUserIds = Array.from(set_uniqueUserIds);
        const members = await Promise.all([...set_uniqueUserIds].map(userId => message.guild.members.fetch(userId)));
        const allMembers = [...members, message.member];
        if (!Streamer_roll.some(role => message.member.roles.cache.has(role))) return message.reply('エントリー条件を満たしていません。');
        if (set_uniqueUserIds.has(message.member.user.id)) return message.reply('視聴者枠に自身を含めることはできません。');
    
        if (members.length === 2) {
            if (!members.every(member => member.roles.cache.has(Verified_roll))) return message.reply('全員がYunite認証済みではありません。');
            await Promise.all(members.map(member => member.roles.add(Listener_roll))); // 視聴者にロールを付与
            
            // PRの計算
            let totalPoints = 0;
            allMembers.forEach(member => {
                member.roles.cache.forEach(role => {
                    const points = PR_map.get(role.name);
                    if (points) {
                        totalPoints += points;
                        console.log(points);
                    }
                });
            });

            let data = {};
            if (fs.existsSync('data.json')) {
                data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
            }
            
            // チームロールの作成　/ 付与
            const teamRoleName = `${message.member.displayName}チーム`;
            let teamRole = message.guild.roles.cache.find(role => role.name === teamRoleName);
            if (!teamRole) {
                teamRole = await message.guild.roles.create({
                    name: teamRoleName,
                    reason: 'チームロールの作成'
                });
            }
            await Promise.all(allMembers.map(member => member.roles.add(teamRole)));
            
            if (!data.teams) {
                data.teams = [];
            }
            const teamExists = data.teams.some(team => team.teamRole === teamRole.id);
            
            if (!teamExists) {
                data.teams.push({
                    teamRole: teamRole.id,
                    userId: [
                        message.member.user.id,
                        uniqueUserIds[0],
                        uniqueUserIds[1]
                    ],
                    totalPoints: totalPoints
                });
            
                try {
                    fs.writeFileSync('data.json', JSON.stringify(data, null, 4));
                    console.log('データを更新しました。');
                } catch (error) {
                    console.log('データの更新中にエラーが発生しました:', error);
                    message.channel.send("内部処理でエラーが発生しました。\n内部レートの保存に失敗しました。");
                }
            } else console.log('データはすでに存在します。');

            // 返信する埋め込み文章を生成
            const embed = new MessageEmbed()
            .setTitle('エントリー完了')
            .setDescription(`チームロールとして${teamRoleName}というロールを作成し3名にロールを付与しました。\n視聴者さんには視聴者ロールを付与しました。`)
            .addFields(
                {name:'以下のメンバーでエントリーを受け付けました',value:`配信者: <@${message.member.user.id}>`},
                {name:'\u200B',value:`視聴者: <@${uniqueUserIds[0]}>`, inline: true},
                {name:'\u200B',value:`視聴者: <@${uniqueUserIds[1]}>`, inline: true},
                {name: '\u200B', value: 'ご不明点があれば <#1159940664281276456> までお願いします。'}
            )
            .setFooter({ text: `${totalPoints}` })
            .setColor('#00acee')
            .setTimestamp()
            return message.channel.send({ embeds: [embed] }); // メッセージを返信して処理を終了
        }
    }
    catch(error) {
        console.log(error)
        message.channel.send("内部処理でエラーが発生しました。\n再度お試しください。\n何度もエラーが出る場合は運営が対応するまでしばらくお待ちください。")
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.channel.id !== command_ch) return;
    if (message.content !== '!set') return;

    const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
    data.teams.sort((a, b) => b.totalPoints - a.totalPoints);

    const assignedGroups = data.teams.map((team, index) => {
        const groupName = Object.keys(roles)[index % Object.keys(roles).length];
        return { team: team, group: groupName };
    });

    for (const item of assignedGroups) {
        const groupRoleId = roles[item.group];

        for (const userId of item.team.userId) {
            try {
                const member = await message.guild.members.fetch(userId);
                if (member) {
                    member.roles.add(groupRoleId).catch(console.error);
                }
            } catch (error) {
                console.error(`ユーザーID ${userId} の取得に失敗しました: `, error);
            }
        }
    }

    console.log(assignedGroups);
    await message.reply("内部レートに応じてグループ分けを行いました。");
});

client.login(token);