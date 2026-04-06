const fs = require('fs');

const prevData = JSON.parse(fs.readFileSync('c:/Users/ba/OneDrive/桌面/stitch/cipher_slate/data_prev.json', 'utf8'));
const currentData = JSON.parse(fs.readFileSync('c:/Users/ba/OneDrive/桌面/stitch/cipher_slate/python_course/data.json', 'utf8'));

// Helper to find lesson
function getLesson(data, modId, lesId) {
    const mod = data.modules.find(m => m.id === modId);
    if (!mod) return null;
    return mod.lessons.find(l => l.id === lesId);
}

// 1. merge les-01-01 animation
const pLes0101 = getLesson(prevData, 'mod-01', 'les-01-01');
const cLes0101 = getLesson(currentData, 'mod-01', 'les-01-01');
if (pLes0101 && cLes0101) {
    const cAnim = cLes0101.content.find(c => c.type === 'animation');
    const pAnimIdx = pLes0101.content.findIndex(c => c.type === 'animation');
    if (cAnim && pAnimIdx !== -1) {
        pLes0101.content[pAnimIdx] = cAnim;
    }
}

// 2. merge les-02-01 animation
const pLes0201 = getLesson(prevData, 'mod-02', 'les-02-01');
const cLes0201 = getLesson(currentData, 'mod-02', 'les-02-01');
if (pLes0201 && cLes0201) {
    const cAnim = cLes0201.content.find(c => c.type === 'animation');
    const pAnimIdx = pLes0201.content.findIndex(c => c.type === 'animation');
    if (cAnim && pAnimIdx !== -1) {
        pLes0201.content[pAnimIdx] = cAnim;
    }
}

// 3. merge les-03-01 animation
const pLes0301 = getLesson(prevData, 'mod-03', 'les-03-01');
const cLes0301 = getLesson(currentData, 'mod-03', 'les-03-01');
if (pLes0301 && cLes0301) {
    const cAnim = cLes0301.content.find(c => c.type === 'animation');
    const pAnimIdx = pLes0301.content.findIndex(c => c.type === 'animation');
    if (cAnim && pAnimIdx !== -1) {
        pLes0301.content[pAnimIdx] = cAnim;
    }
}

// Save back to data.json
fs.writeFileSync('c:/Users/ba/OneDrive/桌面/stitch/cipher_slate/python_course/data.json', JSON.stringify(prevData, null, 2), 'utf8');

// Also recreate generate_json.js in desktop
const genJsonCode = `const fs = require('fs');\nconst path = require('path');\n\nconst data = ${JSON.stringify(prevData, null, 2)};\n\nconst jsonPath = path.join(__dirname, 'cipher_slate', 'python_course', 'data.json');\nfs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');\nconsole.log('Successfully wrote data.json');\n`;

fs.writeFileSync('c:/Users/ba/OneDrive/桌面/stitch/generate_json.js', genJsonCode, 'utf8');
console.log("Done merging!");
