const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');

// プレイヤー名の配列
const playerNames = [
    'HіkаkіnOffіcіаl', 'ᨒ ぷなる ykrzk ᨒ', 'てるるんYouTube', 'demon nemy', 'crystazz',
    'FUNNYs てっぺんやーりん', 'RACs ぐっぱ', 'LYNX vitaminsuu', 'XER Norvey', 'm1ya-_-',
    'LB NiTa3_-', 'KWZ Crylix.', 'NEXUS PSTR', '猫猫は可愛い', '超wavyなKENTAch',
    'よーそら', 'AJS mkmkpad old', 'NEXUS 桃田らいむ', 'FUNNY Takkun', 'UW美少女無罪パイレーツまりね',
    'QOK HIYOOOOOOOOO', 'おわ修行中 橘', 'Srg Nubi修行中', '7hoshi fv', 'FZN snackykonG',
    'mana修行中', 'uw Imo Boaster', 'しょーさんYouTube', '文句言ってる暇あったら練習しろ', 'SunSet 限界高校生',
    'GL_ΤακχοΡɤο ζ', 'CH.どにち 姫 A2', 'DELTA LBworks', 'Blue_p みじゅまるん', 'HungryOtter3410',
    'やえ丸-ゆっくり実況', 'ninzin._.3', 'KC はとぺん修行中', 'お願いしますのトッキー', 'あれん exe',
    'ころろ YouTubeで検索', 'Toshikiとしき', 'gents_ツナ缶', '山田リョウ .', 'ありんgroly.',
    'DIVA IGL', 'XER Swiilol 7', 'jirokiti fanboy', 'FPG あるぱかなのだǃ', 'みんなののんかみ',
    'J1RUAKovaaks', 'LuLu_ho_ma_n', 'VKN-Licht', 'XER えめらるど', 'funny ふんふん',
    'ᴛɪғғᴀɴʏに会いたい症候群', 'ゆきゆきげーむず', '通信登校拒否フォトナ青春物語開幕', 'NEXUS.みみみるくでありんす', 'るんるんるん蜂が飛ぶ',
    'すーぱーおろないとくん', 'キッズダンジョンMVPのみいっち', 'いちごふらぺちー', 'UW Pakeだうｗｗｗ', '超超大型人間',
    'SharK 勉強します', 'LB ryudora_-', 'HEART Choppa', 'YKL Kattooff', 'Celis 千束',
    'うぱりんーうぱぺんファミリー.', 'ECG_そうくん', 'AFT れっしー運極', '雪爆35うぱぺんファミリー', 'マスオOfficial',
    'gents-c らーにっくす', 'LYNX2 ankoro', 'meroxloo', 'YouTubeゆずしで検索', 'ECG 道を開けろ ℜ',
    'Liberty なぎ桜', 'CHJ.kanamelody 姫', 'こぺん-うぱぺんファミリー', 'sora 33 .', 'DNY Everest',
    'GRY Rakiryezz.'
]

// CSVファイルの設定
const csvFilePath = path.join(__dirname, 'replay.csv');
const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: [
        {id: 'rank', title: '順位'},
        {id: 'teamKills', title: 'チーム撃破数'},
        {id: 'player1', title: 'プレイヤー1'},
        {id: 'player1Kills', title: 'プレイヤー1撃破数'},
        {id: 'player2', title: 'プレイヤー2'},
        {id: 'player2Kills', title: 'プレイヤー2撃破数'},
        {id: 'player3', title: 'プレイヤー3'},
        {id: 'player3Kills', title: 'プレイヤー3撃破数'},
        {id: 'player4', title: 'プレイヤー4'},
        {id: 'player4Kills', title: 'プレイヤー4撃破数'}
    ]
});

// ランダムなデータを生成
const data = [];
for (let i = 0; i < 33; i++) {
    const shuffledNames = playerNames.sort(() => 0.5 - Math.random());
    data.push({
        rank: i + 1,
        teamKills: Math.floor(Math.random() * 20),
        player1: shuffledNames[0],
        player1Kills: Math.floor(Math.random() * 10),
        player2: shuffledNames[1],
        player2Kills: Math.floor(Math.random() * 10),
        player3: shuffledNames[2],
        player3Kills: Math.floor(Math.random() * 10),
        player4: '',
        player4Kills: ''
    });
}

// CSVファイルに書き込み
csvWriter.writeRecords(data)
    .then(() => console.log('CSVファイルが正常に生成されました。'));
