const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

// Middleware für das Parsen von JSON-Daten im Request-Body
app.use(express.json());

// Statische Dateien aus dem 'frontend' Verzeichnis servieren
app.use(express.static(path.join(__dirname, 'frontend')));

// Pfad zur JSON-Datei für die Speicherung der Aufgaben und des ausgewählten Wochentags
const todoFilePath = path.join(__dirname, 'data', 'todo.json');

// Route für das Laden der Aufgaben für einen bestimmten Tag
app.get('/tasks/:day', async (req, res) => {
    const day = req.params.day;
    try {
        const data = await fs.readFile(todoFilePath, 'utf8');
        const tasks = JSON.parse(data)[day] || [];
        res.json(tasks);
    } catch (error) {
        console.error('Failed to load tasks:', error);
        res.status(500).json({ error: 'Failed to load tasks' });
    }
});

// Route für das Speichern der Aufgaben für einen bestimmten Tag
app.post('/tasks', async (req, res) => {
    const { currentDay, tasks } = req.body;
    try {
        let data = await fs.readFile(todoFilePath, 'utf8');
        data = JSON.parse(data);
        data[currentDay] = tasks;
        await fs.writeFile(todoFilePath, JSON.stringify(data, null, 2));
        res.sendStatus(200);
    } catch (error) {
        console.error('Failed to save tasks:', error);
        res.status(500).json({ error: 'Failed to save tasks' });
    }
});

// Handler für die Root-URL, um die HTML-Seite zu servieren
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'todolist2funktion.html'));
});

// Server starten
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
