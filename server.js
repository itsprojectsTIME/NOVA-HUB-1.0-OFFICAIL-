
const express = require("express");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const { db, initializeDatabase } = require("./database/db");


const app = express();
app.use(cors());
app.use(express.json());
app.post("/api/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            message: "Password must be at least 8 characters"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        await db.query(`
    INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3)
`, [
    username.trim(),
    email.trim().toLowerCase(),
    hashedPassword
]);
        res.status(201).json({
            message: "Account created successfully!"
        });

    } catch (error) {
        if  (error.code === "23505") {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
});
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax"
    }
}));
const messages = [];

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
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: "Email and password are required"
        });
    }

    try {
const result = await db.query(`
    SELECT * FROM users WHERE email = $1
`, [email.trim().toLowerCase()]);

const account = result.rows[0];

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
                error: "Invalid email or password"
            });
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

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            error: "Login failed"
        });
    }
});



app.get("/profile", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            error: "You must log in first"
        });
    }

    try {
        const result = await db.query(`
            SELECT id, username, email, role, status
            FROM users
            WHERE id = $1
        `, [req.session.userId]);

        const account = result.rows[0];

        if (!account) {
            return res.status(404).json({
                success: false,
                error: "Account not found"
            });
        }

        return res.status(200).json({
            success: true,
            username: account.username,
            email: account.email,
            role: account.role,
            status: account.status
        });

    } catch (error) {
        console.error("Profile error:", error);

        return res.status(500).json({
            success: false,
            error: "Failed to load profile"
        });
    }
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
const PORT = process.env.PORT || 3000;
initializeDatabase()
    .then(() => {
        console.log("Neon database initialized!");

        app.listen(PORT, () => {
            console.log(`API running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database initialization failed:", error);
        process.exit(1);
    });
