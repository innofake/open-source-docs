const fs = require('fs');
const path = require('path');

let reposList = {
    repos: []
};
var docsDirs = fs.readdirSync(`docs`);

docsDirs.forEach(dir => {
    let repo = {
        name: dir
    }
    const versionsPath = `docs/${dir}/versions`;
    if (fs.existsSync(versionsPath)) {
        let versions = fs.readdirSync(versionsPath);
        repo.versions = versions;
    }
    reposList.repos.push(repo);
});

fs.writeFileSync(`repos.json`, JSON.stringify(reposList, null, 2));