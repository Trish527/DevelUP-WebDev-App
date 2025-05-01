const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Folder to save images
const folderPath = path.join(__dirname, 'Images');
if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    console.log("Folder created:", folderPath);
}

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json({ limit: '10mb' })); // Parse JSON with large payload
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Route: Save photo from front-end
app.post('/save-photo', (req, res) => {
    const { imageData } = req.body;

    if (!imageData) {
        return res.status(400).send('No image data provided');
    }

    const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, "");
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `Photo-Booth-${timestamp}.jpeg`;
    const filePath = path.join(folderPath, filename);

    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error('Error saving photo:', err);
            return res.status(500).send('Failed to save photo');
        }

        console.log("Saved:", filename);
        res.send('Photo saved successfully');
    });
});

// Route: Get the most recent saved file
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

// Route: Serve main test page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
