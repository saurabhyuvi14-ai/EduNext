const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
// Allow CORS
app.use(cors());

// Serve client files from the root directory
// When running in Vercel, static files are handled by Vercel's edge, but for local dev
// or fallback, we attempt to serve from one directory up.
// Note: In Vercel serverless functions, __dirname is weird.
// It's safer to not rely on serving static files via Express in Vercel if possible.
// But for local dev, we need it.
if (process.env.NODE_ENV !== 'production') {
    app.use(express.static(path.join(__dirname, '../')));
}

// Endpoint to provide safe env vars to client
app.get('/api/config', (req, res) => {
    res.json({
        firebase: {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
            measurementId: process.env.FIREBASE_MEASUREMENT_ID
        },
        app: {
            controllerId: process.env.CONTROLLER_ID,
            defaultPass: process.env.DEFAULT_PASSWORD
        }
    });
});


// Fallback to index.html for SPA if not found
// Note: In Vercel, this won't be hit for static files if routing is correct,
// but for unhandled routes it might be useful.
// However, since we are doing `api/index.js`, Vercel only routes `/api` to us.
// So we don't need the catch-all here.

// But wait, if we want to run this locally, we need to export the app?
// Vercel uses `module.exports`.

// For local dev, we run `node api/server.js` (the old one) or `node api/index.js`?
// Let's modify api/server.js to use api/index.js logic?
// No, keep it separate. `api/index.js` is Vercel function.
// `server.js` (now `api/server.js`) is legacy/local runner.

module.exports = app;
