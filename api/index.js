const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Specific handler for Prompt Master game to inject API Key
app.get('/api/prompt-master', (req, res) => {
    try {
        const filePath = path.resolve(process.cwd(), 'views', 'prompt-master.html');

        if (!fs.existsSync(filePath)) {
            console.error('File not found:', filePath);
            return res.status(404).send('Game file not found.');
        }

        let content = fs.readFileSync(filePath, 'utf8');

        const injectedScript = `
        <script>
            window.ENV = {
                GEMINI_KEY: "${process.env.GEMINI_KEY || ''}"
            };
        </script>
        `;

        content = content.replace('</head>', `${injectedScript}</head>`);
        res.setHeader('Content-Type', 'text/html');
        res.send(content);

    } catch (error) {
        console.error('Error serving prompt-master:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Fallback or explicit routes for other games if needed, 
// but express.static handles them if they are in public/.
// Example: /god-mode.html is served automatically.

// Start server if run directly
if (require.main === module) {
    require('dotenv').config();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
