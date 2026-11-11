const express = require("express");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cors = require("cors");
const dotenv = require("dotenv");

const result = dotenv.config();
console.log("KEY LENGTH:", process.env.API_KEY_ARTICLE?.length);
console.log(
    "KEY FORMAT:",
    /^[a-f0-9]{32}$/.test(process.env.API_KEY_ARTICLE || "")
);

console.log("ENV PATH:", process.cwd());
console.log("DOTENV ERROR:", result.error);
console.log("ENV KEYS:", Object.keys(result.parsed || {}));


const app = express();
app.use(cors());
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || "nova-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax"
    }
}));
const messages = [];
const accounts = [];

app.get('/', (req, res) => {
        res.json({
        message: "Hello, World! I am Dark Nova, the creator of this API. AND I DONT SUCK AT CODING",
        creator: "Dark Nova",
        status: "API is working!",
        id: "1",
        timestamp: new Date().toUTCString(),
        version: "1.0.0"
    });
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
app.post("/register", async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    if (!username || username.trim() === "") {
        return res.status(400).json({
            success: false,
            error: "Username should not be empty"
        });
    }

    if (!email || email.trim() === "") {
        return res.status(400).json({
            success: false,
            error: "Email should not be empty"
        });
    }

    if (!password) {
        return res.status(400).json({
            success: false,
            error: "Password should not be empty"
        });
    }
    if (password.length < 8) {
    return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters"
    });
}
if (accounts.some(account => account.email === email)) {
    return res.status(409).json({
        success: false,
        error: "This email is already registered"
    })
}    

const hashedPassword = await bcrypt.hash(password, 10);
const newAccount = {
    id: accounts.length + 1,
    username: username,
    email: email,
    password: hashedPassword
}
accounts.push(newAccount);

return res.status(201).json({
    success: true,
    message: "Account created successfully"
});
});
app.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const account = accounts.find(account => account.email === email);

    if (!account) {
    return res.status(401).json({
        success: false,
        error: "Invalid email or password"
    });
}
    const passwordMatch = await bcrypt.compare(
    password,
    account.password
    );
    if (!passwordMatch) {
        return res.status(401).json({
            success: false,
            message: "auth failed"
        })
        
}
req.session.regenerate((err) => {
    if (err) {
        return res.status(500).json({
            success: false,
            error: "Session creation failed"
        });
    }

    req.session.userId = account.id;

    return res.status(200).json({
        success: true,
        message: "Access granted",
        username: account.username
    });
});
});
app.get("/profile", (req, res) => {
    if (!req.session.userId) {
    return res.status(401).json({
        success: false,
        error: "You must log in first"
    });
}
const account = accounts.find(
    account => account.id === req.session.userId
);
    if (!account) {
    return res.status(404).json({
        success: false,
        error: "Account not found"
    });
}
return res.status(200).json({
    success: true,
    username: account.username,
    email: account.email
});
});
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "can not destroy sesstion."
            })
        }
        return res.status(200).json({
        success: true,
        message: "Logged out successfuly!"
    })
    })
});

app.get("/news", async (req, res) => {
    try {
        const params = new URLSearchParams({
            apikey: process.env.API_KEY_ARTICLE,
            country: "sa,gb,us,sy,eg",
            language: "en",
            category: "education,entertainment,other,politics,world"
        });

        const response = await fetch(
            `https://newsdata.io/api/1/latest?${params}`
        );

        const data = await response.json();

        if (!response.ok || data.status === "error") {
            console.log("NEWSDATA.io ERROR:", data);

            return res.status(response.status || 502).json({
                success: false,
                error: "NewsData.io request failed"
            });
        }

        res.json(data);

    } catch (error) {
        console.error("News error:", error);

        res.status(500).json({
            success: false,
            error: "Failed to fetch news"
        });
    }
});

app.listen(3000, () => {
    console.log("API running at http://localhost:3000");
});
