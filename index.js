const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware для обработки JSON
app.use(express.json());
// Разрешить все источники
app.use(cors());

// Подключение к MongoDB
const MONGODB_URI = 'mongodb://127.0.0.1:27017/tasksdb'; // Локальный адрес MongoDB
mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('✅ Подключено к MongoDB'))
    .catch(err => console.error('❌ Ошибка подключения к MongoDB:', err));

// Создание схемы и модели задачи
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Название задачи обязательно'],
        minlength: [3, 'Название должно содержать хотя бы 3 символа']
    },
    completed: {type: Boolean, default: false}
});

const Task = mongoose.model('Task', taskSchema);

// GET: Получить все задачи
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        console.log('Задачи:', tasks); // Логируем задачи в консоль
        res.json(tasks);
    } catch (err) {
        console.error('Ошибка при получении задач:', err);
        res.status(500).json({message: 'Ошибка при получении задач', error: err});
    }
});

// POST: Добавить новую задачу
app.post('/tasks', async (req, res) => {
    const {title} = req.body;
    try {
        const newTask = new Task({title});
        await newTask.save();
        console.log('Новая задача добавлена:', newTask); // Логирование новой задачи
        res.status(201).json(newTask);
    } catch (err) {
        console.error('Ошибка при добавлении задачи:', err);
        res.status(400).json({message: 'Ошибка при добавлении задачи', error: err});
    }
});

// DELETE: Удалить задачу по ID
app.delete('/tasks/:id', async (req, res) => {
    const {id} = req.params;
    try {
        await Task.findByIdAndDelete(id);
        res.status(200).json({message: 'Задача удалена'});
    } catch (err) {
        res.status(400).json({message: 'Ошибка при удалении задачи', error: err});
    }
});

app.put('/tasks/:id', async (req, res) => {
    const {id} = req.params;
    const {title, completed} = req.body;
    try {
        const updatedTask = await Task.findByIdAndUpdate(id, {title, completed}, {new: true});
        res.status(200).json(updatedTask);
    } catch (err) {
        res.status(400).json({message: 'Ошибка при обновлении задачи', error: err});
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
