// Selectors

const toDoInput = document.querySelector('.todo-input');
const toDoBtn = document.querySelector('.todo-btn');
const toDoList = document.querySelector('.todo-list');
const standardTheme = document.querySelector('.standard-theme');
const lightTheme = document.querySelector('.light-theme');
const darkerTheme = document.querySelector('.darker-theme');


// Event Listeners

toDoBtn.addEventListener('click', addToDo);
toDoList.addEventListener('click', deletecheck);
document.addEventListener("DOMContentLoaded", getTodos);
standardTheme.addEventListener('click', () => changeTheme('standard'));
lightTheme.addEventListener('click', () => changeTheme('light'));
darkerTheme.addEventListener('click', () => changeTheme('darker'));

// Check if one theme has been set previously and apply it (or std theme if not found):
let savedTheme = localStorage.getItem('savedTheme');
savedTheme === null ?
    changeTheme('standard')
    : changeTheme(localStorage.getItem('savedTheme'));

// Functions;

// Prevents form from submitting / Prevents form from reloading;

function addToDo(event) {
    event.preventDefault();

    // Fetch the username from the backend
    fetch('http://localhost:3000/getUsername', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to get username');
        }
        return response.json();
    })
    .then(data => {
        const username = data.username;
        console.log('Username:', username);

        // toDo DIV;
        const toDoDiv = document.createElement("div");
        toDoDiv.classList.add('todo', `${savedTheme}-todo`);

        // Create LI
        const newToDo = document.createElement('li');
        if (toDoInput.value === '') {
            alert("You must write something!");
        } else {
            newToDo.innerText = toDoInput.value;
            newToDo.classList.add('todo-item');
            toDoDiv.appendChild(newToDo);

            // Adding task to the server
            const taskData = {
                username: username,
                taskText: toDoInput.value,
                date: new Date().toISOString(),
                taskState: false, // assuming the initial state is false
            };

            // Make a request to your backend to create a new task
            fetch('http://localhost:3000/createTask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Task creation failed');
                }
                return response.json();
            })
            .then(data => {
                console.log('Task created successfully:', data.message);

                // Retrieve the task ID from the server response
                const taskId = data.taskId;

                // Update the new task element with the task ID
                toDoDiv.dataset.taskId = taskId;

                // check btn;
                const checked = document.createElement('button');
                checked.innerHTML = '<i class="fas fa-check"></i>';
                checked.classList.add('check-btn', `${savedTheme}-button`);
                checked.setAttribute('data-task-id', taskId);
                toDoDiv.appendChild(checked);

                // delete btn;
                const deleted = document.createElement('button');
                deleted.innerHTML = '<i class="fas fa-trash"></i>';
                deleted.classList.add('delete-btn', `${savedTheme}-button`);
                deleted.setAttribute('data-task-id', taskId);
                toDoDiv.appendChild(deleted);

                // Append to list;
                toDoList.appendChild(toDoDiv);

                // Clear the input;
                toDoInput.value = '';

                // You can optionally trigger a function to update other parts of the UI
                // or handle additional logic here without needing a page refresh.
                // Example: updateStatistics();

            })
            .catch(error => {
                console.error('Error during task creation:', error.message);
                // Handle task creation error, display a message, etc.
            });
        }
    })
    .catch(error => {
        console.error('Error getting username:', error.message);
        // Handle error, display a message, etc.
    });
}

// Function to complete a task
function completeTask(taskId) {
    // Make a request to mark the task as completed
    fetch(`http://localhost:3000/completeTask/${taskId}`, {
        method: 'PATCH',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error completing task');
        }
        return response.json();
    })
    .then(data => {
        console.log('Task completed successfully:', data.message);
        // Optionally, update the UI to reflect the completed task
        // For example, you might change the style or add a checkmark icon
    })
    .catch(error => {
        console.error('Error completing task:', error.message);
        // Handle error, display a message, etc.
    });
}


function deletecheck(event) {
    const item = event.target;

    // delete
    if (item.classList[0] === 'delete-btn') {
        // Get the task ID from the data-task-id attribute
        const taskId = item.parentElement.dataset.taskId;

        // Make a request to delete the task
        fetch(`http://localhost:3000/deleteTask/${taskId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error deleting task');
            }
            return response.json();
        })
        .then(data => {
            console.log('Task deleted successfully:', data.message);
        })
        .catch(error => {
            console.error('Error deleting task:', error.message);
        });

        // animation
        item.parentElement.classList.add("fall");

        //removing local todos;
        removeLocalTodos(item.parentElement);

        item.parentElement.addEventListener('transitionend', function () {
            item.parentElement.remove();
        });
    }

    // check
    if (item.classList[0] === 'check-btn') {
        item.parentElement.classList.toggle("completed");

        
        // Get the task ID from the data-task-id attribute
        const taskId = item.parentElement.dataset.taskId;
        completeTask(taskId);
    }
}


function getTodos(event) {
    event.preventDefault();

    // Fetch the username from the backend
    fetch('http://localhost:3000/getUsername', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include credentials (cookies) with the request
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to get username');
        }
        return response.json();
    })
    .then(data => {
        const username = data.username;
        console.log('Username:', username);
        // Clear existing tasks
        toDoList.innerHTML = '';

        // Fetch tasks from the server
        fetch(`http://localhost:3000/tasks/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            return response.json();
        })
        .then(data => {
            const tasks = data.tasks;

            tasks.forEach(function(task) {
                // toDo DIV;
                const toDoDiv = document.createElement("div");
                toDoDiv.classList.add("todo", `${savedTheme}-todo`);
                toDoDiv.setAttribute('data-task-id', task.id);

                // Create LI
                const newToDo = document.createElement('li');
                newToDo.innerText = task.taskText;
                newToDo.classList.add('todo-item');
                toDoDiv.appendChild(newToDo);

                // check btn;
                const checked = document.createElement('button');
                checked.innerHTML = '<i class="fas fa-check"></i>';
                checked.classList.add("check-btn", `${savedTheme}-button`);
                checked.setAttribute('data-task-id', task.id);
                toDoDiv.appendChild(checked);

                // delete btn;
                const deleted = document.createElement('button');
                deleted.innerHTML = '<i class="fas fa-trash"></i>';
                deleted.classList.add("delete-btn", `${savedTheme}-button`);
                deleted.setAttribute('data-task-id', task.id);
                toDoDiv.appendChild(deleted);

                // Check task state and apply styles
                if (task.taskState) {
                    // Task is completed, add a class or style
                    toDoDiv.classList.add('completed-task', 'completed');
                }

                // Append to list;
                toDoList.appendChild(toDoDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching tasks:', error.message);
            // Handle error, display a message, etc.
        });
    })
    .catch(error => {
        console.error('Error getting username:', error.message);
        // Handle error, display a message, etc.
    });
}

// Call getTodos to fetch and display tasks
getTodos();


// Change theme function:
function changeTheme(color) {
    localStorage.setItem('savedTheme', color);
    savedTheme = localStorage.getItem('savedTheme');

    document.body.className = color;
    // Change blinking cursor for darker theme:
    color === 'darker' ? 
        document.getElementById('title').classList.add('darker-title')
        : document.getElementById('title').classList.remove('darker-title');

    document.querySelector('input').className = `${color}-input`;
    // Change todo color without changing their status (completed or not):
    document.querySelectorAll('.todo').forEach(todo => {
        Array.from(todo.classList).some(item => item === 'completed') ? 
            todo.className = `todo ${color}-todo completed`
            : todo.className = `todo ${color}-todo`;
    });
    // Change buttons color according to their type (todo, check or delete):
    document.querySelectorAll('button').forEach(button => {
        Array.from(button.classList).some(item => {
            if (item === 'check-btn') {
                button.className = `check-btn ${color}-button`;  
            } else if (item === 'delete-btn') {
                button.className = `delete-btn ${color}-button`; 
            } else if (item === 'todo-btn') {
                button.className = `todo-btn ${color}-button`;
            }
        });
    });
}