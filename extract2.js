const fs = require('fs');
const pdf = require('pdf-parse');

async function main() {
    for (let i = 2; i < process.argv.length; i++) {
        const file = process.argv[i];
        let dataBuffer = fs.readFileSync(file);
        try {
            const data = await pdf(dataBuffer);
            console.log(`\n\n=== ${file} ===`);
            console.log(data.text);
        } catch (e) {
            console.error(`Error parsing ${file}:`, e);
        }
    }
}
main();
