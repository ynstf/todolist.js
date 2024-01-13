const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const cors = require('cors'); 
const session = require('express-session');
const ejs = require('ejs');
const app = express();

// expose on port 5000
const port = 5000;

// create metrics to monitoring
const client = require('prom-client');
const { register } = require('prom-client'); // Import the register from 'prom-client'
const headerCounter = new client.Counter({
    name : "heads_count",
    help : 'Number of heads'
});
const tailCounter = new client.Counter({
    name : "tails_count", // Unique name
    help : 'Number of tails'
});
register.registerMetric(headerCounter);
register.registerMetric(tailCounter);
register.setDefaultLabels({
    app: 'todolist'
});
client.collectDefaultMetrics({ register });

// create session
app.use(session({
    secret: 'hjfdpuydpyufutdotudou',
    resave: true,
    saveUninitialized: true,
    cookie: { sameSite: 'None' }
}));

// enable cros
app.use(cors({ credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// define ejs as engine views
app.set('view engine', 'ejs');
app.use(bodyParser.json());

//database
const db = new sqlite3.Database('./database.db');
db.serialize(() => {
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        name TEXT
    )
`);
db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY,
        userId INTEGER,
        username TEXT,
        taskText TEXT,
        date TEXT,
        taskState INTEGER
    )
`);
});

/// Define API routes and logic 

// test the API
app.get('/test', (req, res) => {
    res.status(200).json({ message: 'Hello, World!' });
});

// Logout route
app.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: 'Error logging out' });
        }

        // Redirect the user to the login page or any other appropriate page
        res.redirect('/');
    });
});


// Add a new endpoint to get the username
app.get('/getUsername', (req, res) => {
    // Check if the user is logged in
    if (!req.session || !req.session.username) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    const username = req.session.username;
    res.status(200).json({ username });
});

// index page
app.get('/', isAuthenticated, (req, res) => {
    // Render the 'index' template
    res.render('index');
});

// registration page
app.get('/registeration', isAuthenticated, (req, res) => {
    // Render the 'register' template
    res.render('register');
});

// login logic
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the user exists
        
        db.get('SELECT id, username, name, password FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                console.error('Error during login:', err.message);
                return res.status(500).json({ error: 'Error during login' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Verify the password
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Set session variables
            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.name = user.name || user.username;

            // Return user details
            res.status(200).json({ message: 'Login successful', user: { username: user.username, name: req.session.name } });
        });
    } catch (error) {
        console.error('Unexpected error during login:', error.message);
        res.status(500).json({ error: 'Unexpected error during login' });
    }
});

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    // Allow access to '/' and '/registeration' for both authenticated and unauthenticated users
    if (req.path === '/' || req.path === '/registeration') {
        return next();
    }

    if (!req.session || !req.session.username) {
        return res.redirect('/'); // Redirect to login page if not logged in
    }

    // User is authenticated, continue to the next middleware or route handler
    next();
}

// home page of todolist user
app.get('/todolist', (req, res) => {
    console.log('Reached /todolist route');
    // Fetch tasks from the database
    db.all('SELECT * FROM tasks', (err, tasks) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).json({ error: 'Error fetching tasks' });
        }

        // Render the 'todolist' template with the retrieved tasks
        console.log('Rendering todolist template');
        res.render('todolist', { username: req.session.username, tasks });
    });
});

// registration logic
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) {
        return res.status(500).json({ error: 'Error creating user' });
        }

        res.status(200).json({ message: 'User created successfully' });
    });
});

// create new task
app.post('/createTask', (req, res) => {
    const { username, taskText, date, taskState } = req.body;

    // Retrieve the userId based on the provided username
    db.get('SELECT id FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Error finding user' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = user.id;

        // Insert the task into the tasks table
        db.run(
            'INSERT INTO tasks (userId, username, taskText, date, taskState) VALUES (?, ?, ?, ?, ?)',
            [userId, username, taskText, date, taskState],
            function (err) {
                if (err) {
                    console.error('Error creating task:', err);
                    return res.status(500).json({ error: 'Error creating task' });
                }
        
                // Get the last inserted ID
                const taskId = this.lastID;
        
                res.status(200).json({ message: 'Task created successfully', taskId: taskId });
            }
        );
    });
});

// montion task as completed
app.patch('/completeTask/:taskId', (req, res) => {
    const { taskId } = req.params;

    // Fetch the current state of the task
    db.get('SELECT taskState FROM tasks WHERE id = ?', [taskId], (err, task) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching task state' });
        }

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const currentTaskState = task.taskState;

        // Toggle the taskState
        const newTaskState = !currentTaskState;

        // Update the taskState in the database
        db.run('UPDATE tasks SET taskState = ? WHERE id = ?', [newTaskState, taskId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error updating task state' });
            }

            res.status(200).json({ message: 'Task state updated successfully', newTaskState });
        });
    });
});

// delete tasks based on the taskId
app.delete('/deleteTask/:taskId', (req, res) => {
    const { taskId } = req.params;

    // Delete the task from the database
    db.run('DELETE FROM tasks WHERE id = ?', [taskId], (err) => {
        if (err) {
        return res.status(500).json({ error: 'Error deleting task' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    });
});

// get tasks based on the username
app.get('/tasks/:username', (req, res) => {
    const { username } = req.params;

    // Fetch the userId based on the username
    db.get('SELECT id FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching user information' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = user.id;

        // Retrieve all tasks for the specific user
        db.all('SELECT * FROM tasks WHERE userId = ?', [userId], (err, tasks) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching tasks' });
            }

            res.status(200).json({ tasks });
        });
    });
});

// Retrieve all users
app.get('/users', (req, res) => {
    db.all('SELECT * FROM users', (err, users) => {
    if (err) {
        return res.status(500).json({ error: 'Error fetching users' });
    }

    res.status(200).json({ users });
    });
});

// define metrics route
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// run the server on my port
const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

const closeServer = () => {
server.close();
};
// eport app to test unite
module.exports = { app, closeServer };