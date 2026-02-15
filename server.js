const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const https = require('https'); // Notification bhejne ke liye native module
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// --- Static Files Path Setup ---
// Yeh line check karegi ki index.html kahan hai (Root me ya Public folder me)
app.use(express.static(__dirname)); 
app.use(express.static(path.join(__dirname, 'public')));

// Razorpay Instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET 
});

// --- API 1: Razorpay Order Create ---
app.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100, 
            currency: "INR",
            receipt: "order_rcptid_" + Date.now()
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).send("Error creating order");
    }
});

// --- API 2: Send OneSignal Notification (NEW - Added to fix notification issue) ---
app.post('/send-notification', (req, res) => {
    const { targetUid, title, message } = req.body;

    // Data to send to OneSignal
    const data = JSON.stringify({
        app_id: "4e0f6959-307c-4cb9-89a2-c3982dcebdc1", // Aapka App ID
        include_aliases: { "external_id": [targetUid] },
        headings: { "en": title },
        contents: { "en": message },
        target_channel: "push"
    });

    const options = {
        hostname: 'onesignal.com',
        port: 443,
        path: '/api/v1/notifications',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic os_v2_app_jyhwswjqprgltcncyomc3tv5yfjmtbsw4s4ukmneruoyreoy3qgz6fw4vl757f4gy4kay6pch6uazclkz64gt6hqiyhjjt3w5awcgta' // Aapka API Key
        }
    };

    const request = https.request(options, (response) => {
        let body = '';
        response.on('data', (d) => {
            body += d;
        });
        response.on('end', () => {
            console.log('Notification Sent:', body);
            res.status(200).json({ success: true, response: JSON.parse(body) });
        });
    });

    request.on('error', (e) => {
        console.error('Notification Error:', e);
        res.status(500).json({ success: false, error: e.message });
    });

    request.write(data);
    request.end();
});

// --- Home Route ---
app.get('/', (req, res) => {
    // Koshish karega 'public/index.html' dhoondne ki
    let filePath = path.join(__dirname, 'public', 'index.html');
    
    // Agar wahan nahi mili, to main folder me dhoondega
    res.sendFile(filePath, (err) => {
        if (err) {
            res.sendFile(path.join(__dirname, 'index.html'));
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
