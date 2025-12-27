const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], messages: [] }, null, 2));
}

function readDB() {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    getUsers: () => readDB().users,
    addUser: (user) => {
        const db = readDB();
        db.users.push(user);
        writeDB(db);
        return user;
    },
    findUser: (username) => {
        const db = readDB();
        return db.users.find(u => u.username === username);
    },
    getMessages: () => readDB().messages,
    addMessage: (msg) => {
        const db = readDB();
        db.messages.push(msg);
        writeDB(db);
        return msg;
    }
};
