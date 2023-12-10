const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const fs = require('fs');
const csv = require('csv-parser');

const guildId = '1159887053190864906';
const yuniteApiKey = '';
const yuniteApiUrl = `https://yunite.xyz/api/v3/guild/${guildId}/registration/links`;

const platinum_roll = "1182689797513412708" //プラチナマッチ
const gold_roll = "1182690325827964929" //ゴールドマッチ
const silver_roll = "1182690346996596756" //シルバーマッチ

const assignedRoles = {
    platinum: 0,
    gold: 0,
    silver: 0,
    unrank: 0
};

const csv_purse = [];
const csvFiles = ['a.csv', 'b.csv', 'c.csv'];
const jsonData = JSON.parse(fs.readFileSync('./test.json'));

let allPlayerNames

client.once('ready', async () => {
    try {
        const allData = await Promise.all(csvFiles.map(file => readCsvFile(file)));
        allData.forEach(data => csv_purse.push(...data)); // 結果を統合

        console.log('CSVファイルの読み込み完了');
        main();
    } catch (error) {
        console.error('CSVファイルの読み込み中にエラーが発生しました:', error);
    }

    console.log('Bot is ready!');
});

function readCsvFile(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

async function getYuniteData(userIds) {
    // ユーザーIDのリストを最大80個ずつのバッチに分割する関数
    const chunkArray = (array, size) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    };

    try {
        const userIdChunks = chunkArray(userIds, 80);
        const allData = [];

        for (const chunk of userIdChunks) {
            const response = await fetch(yuniteApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Y-Api-Token': `${yuniteApiKey}`,
                },
                body: JSON.stringify({
                    type: "DISCORD",
                    userIds: chunk
                })
            });

            if (!response.ok) {
                console.error(`Error fetching data for chunk. Status: ${response.status}`);
                continue; // エラーが発生したバッチをスキップ
            }

            const purse = await response.json();
            const res_data = purse.users.map(user => ({
                epicName: user.epic.epicName,
                discordId: user.discord.id
            }));
            allData.push(...res_data);
        }

        return allData;
    } catch (error) {
        console.error('Error fetching registration data from Yunite:', error);
        throw error;
    }
}


function getRoleName(roleId) {
    if (roleId === platinum_roll) return 'プラチナマッチ';
    if (roleId === gold_roll) return 'ゴールドマッチ';
    if (roleId === silver_roll) return 'シルバーマッチ';
    return 'なし';
}

async function assignRoleToTeam(team, role, rank) {
    if ((role === platinum_roll && assignedRoles.platinum >= 33) ||
        (role === gold_roll && assignedRoles.gold >= 33) ||
        (role === silver_roll && assignedRoles.silver + assignedRoles.unrank >= 33)) {
        return;
    }

    for (const userId of team.userId) {
        // Discord APIを使用してユーザー名を取得
        const user = allPlayerNames.find(player => player.discordId === userId);
        const userName = user ? user.epicName : '不明なユーザー';
        // ロール名を取得
        const roleName = getRoleName(role);
        const member = await client.guilds.cache.get(guildId).members.fetch(userId);
        await member.roles.add(role);
        console.log(`${userName}（ID: ${userId}）に「${roleName}」ロールを付与。チームの順位: ${rank}`);
    }

    assignedRoles[role === platinum_roll ? 'platinum' : role === gold_roll ? 'gold' : 'silver']++;
}

async function main() {
    const allMemberIds = jsonData.teams.flatMap(team => team.userId);
    allPlayerNames = await getYuniteData(allMemberIds);
    
    for (const team of jsonData.teams) {
        const playerNames = team.userId.map(id => {
            const player = allPlayerNames.find(player => player.discordId === id);
            return player ? player.epicName : '不明なプレイヤー';
        });

        const matchingEntry = csv_purse.find(entry => {
            return  playerNames.includes(entry['プレイヤー1']) &&
                    playerNames.includes(entry['プレイヤー2']) &&
                    playerNames.includes(entry['プレイヤー3']);
        });

        let role;
        let rank;
        if (matchingEntry) {
            rank = Object.values(matchingEntry)[0];
            if (rank <= 11) {
                role = platinum_roll;
            } else if (rank <= 22) {
                role = gold_roll;
            } else if (rank <= 33) {
                role = silver_roll;
            } else {
                continue; // 33位以上は処理しない
            }
        } else {
            // CSVデータに存在しない場合はシルバーマッチに優先的に割り当て
            role = silver_roll;
            assignedRoles.unrank++;
        }
    
        assignRoleToTeam(team, role, rank).catch(console.error);
    }
    console.log(assignedRoles)
}

client.login('');