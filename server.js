const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware für das Parsen von JSON-Daten im Request-Body
app.use(express.json());

// Statische Dateien aus dem 'frontend' Verzeichnis servieren
app.use(express.static(path.join(__dirname, 'frontend')));

// Pfad zur JSON-Datei für die Speicherung der Aufgaben und des ausgewählten Wochentags
const todoFilePath = path.join(__dirname, 'data', 'todo.json');
let selectedDay = 'tasksMo'; // Standardwert für den ausgewählten Wochentag

// Beim Start des Servers prüfen und ggf. `todo.json` initialisieren
initializeTodoFile();

async function initializeTodoFile() {
    try {
        await fs.access(todoFilePath);
    } catch (error) {
        // Wenn Datei nicht existiert, initialisiere sie mit leeren Objekten für die Wochentage
        const initialData = {
            tasksMo: [],
            tasksDi: [],
            tasksMi: [],
            tasksDo: [],
            tasksFr: [],
            tasksSa: [],
            tasksSo: []
        };
        await fs.writeFile(todoFilePath, JSON.stringify(initialData, null, 2));
    }
}

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
        selectedDay = currentDay; // Aktualisiere den ausgewählten Wochentag
        res.sendStatus(200);
    } catch (error) {
        console.error('Failed to save tasks:', error);
        res.status(500).json({ error: 'Failed to save tasks' });
    }
});

// Route für das Speichern des aktuellen Wochentags und der dazugehörigen Aufgaben
app.post('/selectedDay', async (req, res) => {
    const { selectedDay: newSelectedDay, tasks } = req.body;
    try {
        let data = await fs.readFile(todoFilePath, 'utf8');
        data = JSON.parse(data);
        data[newSelectedDay] = tasks; // Speichere die Aufgaben für den neuen ausgewählten Wochentag
        await fs.writeFile(todoFilePath, JSON.stringify(data, null, 2));
        selectedDay = newSelectedDay; // Aktualisiere den ausgewählten Wochentag
        res.sendStatus(200);
    } catch (error) {
        console.error('Failed to save selected day:', error);
        res.status(500).json({ error: 'Failed to save selected day' });
    }
});

// Handler für die Root-URL, um die HTML-Seite zu servieren
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'todolist2funktion.html'));
});

// Handler für das Senden des aktuellen ausgewählten Wochentags
app.get('/selectedDay', (req, res) => {
    res.json({ selectedDay });
});

// Server starten
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
