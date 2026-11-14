
const express = require("express");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const { db, initializeDatabase } = require("./database/db");
const athkar = require("./data/athkar.json");


const app = express();
app.use(cors({
    origin: [
        "https://nova-hub.darknova.workers.dev",
        "http://127.0.0.1:5500"
    ],
    credentials: true
}));
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
app.set("trust proxy", 1);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
cookie: {
    httpOnly: true,
    sameSite: "none",
    secure: true
}
}));
async function isAdmin(req, res, next) {
    try {
        if (!req.session?.userId) {
            return res.status(401).json({
                message: "Please log in"
            });
        }

        const result = await db.query(
            "SELECT role FROM users WHERE id = $1",
            [req.session.userId]
        );

        if (result.rows.length === 0 ||
            result.rows[0].role !== "admin") {
            return res.status(403).json({
                message: "Admin access required"
            });
        }

        next();
    } catch (error) {
        console.error("Admin check error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
}
app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, username, email, role, status, created_at
             FROM users
             ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            users: result.rows
        });

    } catch (error) {
        console.error("Fetch users error:", error);
        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
    }); 
    app.patch("/api/admin/users/:id/role", isAdmin, async (req, res) => {
    const userId = Number(req.params.id);
    const { role } = req.body;

    if (!Number.isInteger(userId) || !["admin", "user"].includes(role)) {
        return res.status(400).json({
            message: "Invalid user ID or role"
        });
    }

    if (userId === req.session.userId) {
        return res.status(403).json({
            message: "You cannot change your own role"
        });
    }

    try {
        const target = await db.query(
            "SELECT role FROM users WHERE id = $1",
            [userId]
        );

        if (target.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (target.rows[0].role === "admin" && role === "user") {
            const admins = await db.query(
                "SELECT COUNT(*) FROM users WHERE role = 'admin'"
            );

            if (Number(admins.rows[0].count) <= 1) {
                return res.status(400).json({
                    message: "Cannot remove the last admin"
                });
            }
        }

        await db.query(
            "UPDATE users SET role = $1 WHERE id = $2",
            [role, userId]
        );

        res.json({
            success: true,
            message: "User role updated!"
        });

    } catch (error) {
        console.error("Role update error:", error);
        res.status(500).json({
            message: "Failed to update role"
        });
    }
});
app.patch("/api/admin/users/:id/status", isAdmin, async (req, res) => {
    const userId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(userId) ||
        !["active", "suspended"].includes(status)) {
        return res.status(400).json({
            message: "Invalid user ID or status"
        });
    }

    if (userId === req.session.userId) {
        return res.status(403).json({
            message: "You cannot change your own status"
        });
    }

    try {
        const result = await db.query(
            "UPDATE users SET status = $1 WHERE id = $2 RETURNING id",
            [status, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: `User ${status} successfully!`
        });

    } catch (error) {
        console.error("Status update error:", error);
        res.status(500).json({
            message: "Failed to update user status"
        });
    }
});
app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {
        return res.status(400).json({
            message: "Invalid user ID"
        });
    }

    if (userId === req.session.userId) {
        return res.status(403).json({
            message: "You cannot delete your own account"
        });
    }

    try {
        const result = await db.query(
            "DELETE FROM users WHERE id = $1 RETURNING id",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "User deleted successfully!"
        });

    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
            message: "Failed to delete user"
        });
    }
});
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
        if (account.status !== "active") {
    return res.status(403).json({
        success: false,
        error: "Your account is suspended"
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
app.post("/saveprayer", async (req, res) => {
    if (!req.session?.userId) {
        return res.status(401).json({
            error: "FAILED TO AUTH!",
            message:"Please log in for more features!"
        })
    }
    const prayerName = req.body.prayer_name;
    const completed = req.body.completed;
    const prayerDate = req.body.prayer_date;
    const allowedPrayers = [
    "Fajr",
    "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha"
];

if (!allowedPrayers.includes(prayerName)) {
    return res.status(400).json({
        error: "Invalid prayer name"
    });
}
if (typeof completed !== "boolean") {
    return res.status(400).json({
        error: "Invalid completion value"
    });
}
if (
    typeof prayerDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(prayerDate) ||
    Number.isNaN(Date.parse(prayerDate))
) {
    return res.status(400).json({
        error: "Invalid prayer date"
    });
}
try {
    await db.query(
        `INSERT INTO prayer_records
        (user_id, prayer_name, prayer_date, completed)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (prayer_name, user_id, prayer_date)
        DO UPDATE SET completed = EXCLUDED.completed`
    );

    return res.status(200).json({
        success: true,
        message: "Prayer saved successfully!"
    });

} catch (error) {
    console.error("Save prayer error:", error);

    return res.status(500).json({
        success: false,
        error: "Failed to save prayer"
    });
}

})

app.get("/getprayerrecords", async (req, res) => {
if (!req.session?.userId) {
    return res.status(401).json({
        error: "FAILED TO AUTH!",
        message: "Please log in first!"
    });
}
try {
    const result = await db.query(
        "SELECT * FROM prayer_records WHERE user_id = $1 ORDER BY prayer_date DESC",
        [req.session.userId]
    );
    return res.status(200).json({
    success: true,
    records: result.rows
});
}
catch (error) {
    console.error("Get prayer records error:", error);
    return res.status(500).json({
        success: false,
        error: "Failed to fetch prayer records"
    });
}
})
app.get("/athkar", (req, res) => {
    res.json(athkar)
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
