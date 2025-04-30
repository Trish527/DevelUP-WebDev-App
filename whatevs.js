const express = require('express');
const cors = require('cors'); // <-- Import cors
const fs = require('fs');
const path = require('path');

const app = express();
const folderPath = 'C:\\Users\\Trisha\\Downloads\\wow'; // Make sure to escape backslashes

app.use(cors()); // <-- Enable CORS for all origins

app.get('/recent-file', (req, res) => {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory');
        }

        let recentFile;
        let recentTime = 0;

        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            const stats = fs.statSync(filePath);

            if (stats.mtimeMs > recentTime) {
                recentTime = stats.mtimeMs;
                recentFile = file;
            }
        });

        res.json({ recentFile });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});