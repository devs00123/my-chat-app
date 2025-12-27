const router = require('express').Router();
const db = require('../utils/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const { v4: uuidv4 } = require('uuid'); // Removed unused

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Register request:', username);

        // Check user
        const existingUser = db.findUser(username);
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            _id: Date.now().toString(), // Simple ID
            username,
            password: hashedPassword,
            role: 'user', // Default role
            isBlocked: false,
            createdAt: new Date().toISOString()
        };

        db.addUser(newUser);
        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = db.findUser(username);
        if (!user) return res.status(404).json({ message: "User not found" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: "Wrong credentials" });

        if (user.isBlocked) return res.status(403).json({ message: "Account is blocked" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey');

        // Return user without password
        const { password: _, ...userDetails } = user;
        res.status(200).json({ details: userDetails, token });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get Users (Admin)
router.get('/users', (req, res) => {
    const users = db.getUsers().map(u => {
        const { password, ...other } = u;
        return other;
    });
    res.status(200).json(users);
});

module.exports = router;
