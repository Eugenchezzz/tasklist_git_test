const express = require('express');
const app = express();
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.json());


app.use(express.static(__dirname)); // указываем экпрессу на корневую директорию проекта

//подключение ejs
app.set('views', path.join(__dirname, 'ejs_pages'));
app.set('view engine', 'ejs');


// переменная с данными для подключения к бд
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0887',
    database: 'taskList',
    port: 3306
});

db.connect((err)=>{
    if(err){
        throw err;
        console.log('ошибка подключения к бд');
    } else {
        console.log('подключено к бд');
    }
})


let tasks_count;
let all_bd_data

function get_count(callback) {
    db.query('SELECT COUNT(*) AS count FROM tasks', (err, result) => {
        if (err) {
            throw err;
        } else {
            tasks_count = result[0].count;
            console.log('записей в бд -  ' + tasks_count);
            callback(); // Вызываем колбэк после завершения запроса
        }
    });
}

function get_all_bd_data() {
    db.query('SELECT * FROM tasks', (err, result) => {
        if (err) {
            throw err;
        } else {
            console.log('количество задач: ' + tasks_count);

            }
            all_bd_data = result;

    });
}

get_count(() => {
    get_all_bd_data();
});

function delete_row(nTaskValue){
    db.query('DELETE FROM tasks WHERE id = ?',[nTaskValue],(err)=>{
        if(err){
            console.log(err);
        } else {
            console.log('запись с id ' + nTaskValue + ' удалена успешно');
        }
    })
}

app.get('/', (req, res) => {
    // Получаем данные из базы данных
    db.query('SELECT * FROM tasks', (err, result) => {
        if (err) {
            throw err;
        } else {
            // Рендерим шаблон EJS, передавая данные из базы данных
            res.render('index', { tasks: result });
        }
    });
});

app.delete('/delete_row/:nTaskValue', (req,res)=>{
    const nTaskValue = req.params.nTaskValue;
    delete_row(nTaskValue);
})

app.post('/create_new_row', (req, res) => {
    try {
        const new_task_text = req.body.new_task_text;
        const new_task_deadline = req.body.new_task_deadline;

        // Выполнение SQL-запроса
        db.query('INSERT INTO tasks (task, date) VALUES (?, ?)', [new_task_text, new_task_deadline], (err, result) => {
            if (err) {
                console.error('Ошибка при выполнении SQL-запроса:', err);
                return res.status(500).json({ success: false, message: 'Ошибка сервера' });
            }

            console.log('Новая задача успешно добавлена в базу данных');
            res.json({ success: true, message: 'Задача успешно создана' });
        });
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});




app.listen(5000, ()=>{
    console.log('запущено на порту 5000')
})


