const express = require("express");
process.env.ADMIN_PASSWORD = "DARKNOVA";
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
const messages = [];

app.get('/', (req, res) => {
    res.send('Welcome to Dark Nova!');
});

app.get("/about", (req, res) => {
    res.json({
        message: "Hello, World! I am Dark Nova, the creator of this API. AND I DONT SUCK AT CODING",
        creator: "Dark Nova",
        status: "API is working!",
        id: "1",
        timestamp: new Date().toUTCString(),
        version: "1.0.0"
    });
});
app.get("/status", (req, res) => {
    res.json({
    status: "Online",
    uptime: process.uptime(),
    version: "1.0.0"
});

});
app.post("/messages", (req, res) => {
    const message = req.body.message;

    if (!message || message.trim() === "") {
        return res.status(400).json({
            success: false,
            error: "Message cannot be empty"
        });
    }

const newMessage = {
    id: messages.length + 1,
    username: "Dark Nova",
    message: message,
    timestamp: new Date().toISOString()
};

    messages.push(newMessage);

    console.log("New message:", newMessage);

    res.status(201).json({
        success: true,
        data: newMessage
    });
});
app.get("/messages", (req, res) => {
    res.json({
        messages: messages
    });
});
app.post("/adminpass", (req, res) => {
    const password = req.body.password;

    if (password === process.env.ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});
app.listen(3000, () => {
    console.log("API running at http://localhost:3000");
});
