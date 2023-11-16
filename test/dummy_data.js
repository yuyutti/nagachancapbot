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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomTeamRole() {
    let result = '';
    for (let i = 0; i < 18; i++) {
        result += getRandomInt(0, 9).toString();
    }
    return result;
}

function getRandomTotalPoints() {
    const values = Object.values(PR_list);
    let total = 0;
    for (let i = 0; i < 3; i++) {
        total += values[getRandomInt(0, values.length - 1)];
    }
    return total;
}

function generateTeams(numTeams) {
    const teams = [];
    for (let i = 0; i < numTeams; i++) {
        teams.push({
            teamRole: getRandomTeamRole(),
            totalPoints: getRandomTotalPoints()
        });
    }
    return teams;
}

const generatedTeams = generateTeams(198);
console.log(JSON.stringify({ teams: generatedTeams }, null, 4));