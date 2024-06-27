async function requestTextWithGET(url) { //meow
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        return text;
    } catch (error) {
        console.error('Failed to fetch the tasks:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('addButton');
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const levelBar = document.querySelector('.level-bar');
    const dayLinks = document.querySelectorAll('.mainNav a');

    // Beim Laden der Seite die Aufgaben für den aktuellen Tag laden
    loadTasks();

    // Eventlistener für Hinzufügen-Button
    addButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();

        if (taskText !== '') {
            addTask(taskText, false);
            taskInput.value = '';
            taskInput.focus();
            updateProgress();
            saveTasks();
        }
    });

    // Funktion zum Hinzufügen einer Aufgabe zur Liste
    function addTask(taskText, completed) {
        const listItem = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = completed;

        const taskSpan = document.createElement('span');
        taskSpan.textContent = taskText;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'x';
        removeButton.classList.add('remove-button');
        removeButton.addEventListener('click', () => {
            listItem.remove();
            updateProgress();
            saveTasks();
        });

        checkbox.addEventListener('change', () => {
            updateProgress();
            saveTasks();
        });

        listItem.appendChild(checkbox);
        listItem.appendChild(taskSpan);
        listItem.appendChild(removeButton);
        taskList.appendChild(listItem);

        // Speichere die Aufgabe im todo.json
        saveTasks();
    }

    // Funktion zum Aktualisieren des Fortschritts und der Level-Bar
    function updateProgress() {
        const tasks = taskList.getElementsByTagName('li');
        const totalTasks = tasks.length;
        const completedTasks = taskList.querySelectorAll('input[type="checkbox"]:checked').length;

        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        levelBar.style.width = progress + '%';

        if (progress === 100) {
            levelBar.classList.add('complete');
        } else {
            levelBar.classList.remove('complete');
        }

        Array.from(tasks).forEach(task => {
            const checkbox = task.querySelector('input[type="checkbox"]');
            const taskSpan = task.querySelector('span');
            if (checkbox.checked) {
                taskSpan.style.textDecoration = 'line-through';
            } else {
                taskSpan.style.textDecoration = 'none';
            }
        });
    }

    // Funktion zum Speichern der Aufgaben über einen POST-Request
    async function saveTasks() {
        const tasks = [];
        Array.from(taskList.children).forEach(listItem => {
            const checkbox = listItem.querySelector('input[type="checkbox"]');
            const taskSpan = listItem.querySelector('span');
            tasks.push({ text: taskSpan.textContent, completed: checkbox.checked });
        });

        try {
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currentDay, tasks })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to save tasks:', error);
        }
    }

    // Funktion zum Laden der Aufgaben für den aktuellen Tag über einen GET-Request
    async function loadTasks() {
        const params = new URLSearchParams(window.location.search);
        const currentDay = params.get('tasksAnzeigen') || localStorage.getItem('tasksAnzeigen') || 'tasksMo'; // URL-Parameter hat Vorrang
        localStorage.setItem('tasksAnzeigen', currentDay); // Speichere den aktuellen Tag im localStorage
        const url = `/tasks/${currentDay}`;
        const tasksText = await requestTextWithGET(url);

        if (tasksText) {
            try {
                const tasks = JSON.parse(tasksText) || [];
                taskList.innerHTML = '';
                tasks.forEach(task => addTask(task.text, task.completed));
                updateProgress();
            } catch (error) {
                console.error('Failed to parse tasks:', error);
            }
        }
    }

    // Initiale Aktualisierung des Fortschritts
    updateProgress();
});

async function requestTextWithGET(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}
