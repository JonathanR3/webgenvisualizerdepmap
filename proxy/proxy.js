import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

// Express app
const app = express();
// Port hosting proxy
const port = 3000;
// Enable CORS
app.use(cors()); 

// Requests are tunneled through the proxy (route handler entry point is localhost:3000/) to bypass CORS
app.get('/', async (req, res) => {
    try {
        // Request URL of API call
        const url = req.query.url;

        if (!url) {
            return res.status(400).send('URL Not Found');
        }

        // Wait for response from API host
        const response = await fetch(url);

        // Response headers being sent along response to get through CORS
        const headers = response.headers;
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': headers.get('access-control-allow-headers'),
            'Access-Control-Max-Age': headers.get('access-control-max-age')
        });

        // Resolve promise for content from API and send it back to front end client
        res.send(await response.text());
    }
    catch (error) {
        console.log('Error with proxy: ', error);
        res.status(500).send('Internal server error');
    }
})

// Start up proxy
app.listen(port, () => {
    console.log(`Proxy is currently running on ${port}`);
})