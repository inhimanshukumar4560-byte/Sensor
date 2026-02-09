const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// --- CHANGE: Path fixing logic ---
// Yeh line check karegi ki index.html kahan hai (Root me ya Public folder me)
app.use(express.static(__dirname)); 
app.use(express.static(path.join(__dirname, 'public')));

// Razorpay Instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET 
});

// Order Create API
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

// Home Route (Updated)
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
