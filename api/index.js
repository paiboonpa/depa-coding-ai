const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    try {
        // Resolve path safely for Vercel environment
        // In Vercel, process.cwd() is the root of the project
        const filePath = path.resolve(process.cwd(), 'prompt-master.html');

        if (!fs.existsSync(filePath)) {
            console.error('File not found:', filePath);
            return res.status(404).send('Game file not found on server.');
        }

        // Read the file synchronously (ok for serverless startup)
        let content = fs.readFileSync(filePath, 'utf8');

        // Inject the API key safely
        // We look for the head tag to inject our global variable script
        // and we also replace the hardcoded key variable if needed, but injecting a global is cleaner.
        const injectedScript = `
        <script>
            window.ENV = {
                GEMINI_KEY: "${process.env.GEMINI_KEY || ''}"
            };
        </script>
        `;

        // Inject before closing head
        content = content.replace('</head>', `${injectedScript}</head>`);

        // Serve the modified HTML
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(content);

    } catch (error) {
        console.error('Error serving prompt-master:', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
};
