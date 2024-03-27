const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const clearAllTasksBtn = document.getElementById('clearAllTasks');
const confirmationModal = document.getElementById('confirmationModal');
const confirmClearTasksBtn = document.getElementById('confirmClearTasks');
const cancelClearTasksBtn = document.getElementById('cancelClearTasks');

const inboxList = document.getElementById('inboxList');
const todayList = document.getElementById('todayList');
const thisWeekList = document.getElementById('thisWeekList');
const thisMonthList = document.getElementById('thisMonthList');
const thisYearList = document.getElementById('thisYearList');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

taskInput.value = localStorage.getItem('taskInputValue') || '';

taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            addTask(taskText, inboxList);
            taskInput.value = '';
            localStorage.removeItem('taskInputValue');
        }
    }
});

taskInput.addEventListener('keyup', (event) => {
    if (event.key !== 'Enter') {
        localStorage.setItem('taskInputValue', taskInput.value);
    }
});

addTaskBtn.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    if (taskText !== '') {
        addTask(taskText, inboxList);
        taskInput.value = '';
        localStorage.removeItem('taskInputValue');
    }
});

clearAllTasksBtn.addEventListener('click', () => {
    confirmationModal.style.display = 'block';
});

confirmClearTasksBtn.addEventListener('click', () => {
    clearAllTasks();
    confirmationModal.style.display = 'none';
});

cancelClearTasksBtn.addEventListener('click', () => {
    confirmationModal.style.display = 'none';
});

function addTask(text, list) {
    const taskItem = document.createElement('li');
    taskItem.textContent = text;
    taskItem.draggable = true;
    taskItem.addEventListener('dragstart', dragStart);
    taskItem.addEventListener('click', toggleTaskCompletion);
    list.appendChild(taskItem);
    tasks.push(taskItem);
    saveTasksToLocalStorage();
}

function toggleTaskCompletion(event) {
    event.currentTarget.classList.toggle('completed');
    saveTasksToLocalStorage();
}

function clearAllTasks() {
    const lists = [inboxList, todayList, thisWeekList, thisMonthList, thisYearList];
    lists.forEach(list => {
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }
    });
    tasks = [];
    saveTasksToLocalStorage();
}

function saveTasksToLocalStorage() {
    const taskElements = Array.from(document.querySelectorAll('li'));
    const taskData = taskElements.map(taskElement => ({
        text: taskElement.textContent,
        completed: taskElement.classList.contains('completed'),
        parentId: taskElement.parentNode.id
    }));
    localStorage.setItem('tasks', JSON.stringify(taskData));
}

function loadTasksFromLocalStorage() {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    storedTasks.forEach(taskData => {
        const list = document.getElementById(taskData.parentId);
        const taskItem = document.createElement('li');
        taskItem.textContent = taskData.text;
        taskItem.classList.toggle('completed', taskData.completed);
        taskItem.draggable = true;
        taskItem.addEventListener('dragstart', dragStart);
        taskItem.addEventListener('click', toggleTaskCompletion);
        list.appendChild(taskItem);
        tasks.push(taskItem);
    });
}

loadTasksFromLocalStorage();

function dragStart(event) {
    event.dataTransfer.setData('text/plain', null);
    event.currentTarget.classList.add('dragging');
}

const droppableAreas = document.querySelectorAll('.droppable');
droppableAreas.forEach(area => {
    area.addEventListener('dragover', dragOver);
    area.addEventListener('drop', drop);
});

function dragOver(event) {
    event.preventDefault();
    const taskItem = document.querySelector('.dragging');
    const currentList = this;
    const taskItems = Array.from(currentList.children);
    const draggedItemIndex = taskItems.indexOf(taskItem);
    const targetIndex = getDragTargetIndex(event.clientY, taskItems);

    if (targetIndex > draggedItemIndex && targetIndex < taskItems.length - 1) {
        currentList.insertBefore(taskItem, taskItems[targetIndex + 1]);
    } else if (targetIndex < draggedItemIndex) {
        currentList.insertBefore(taskItem, taskItems[targetIndex]);
    }
}

function getDragTargetIndex(y, taskItems) {
    const boxHeight = taskItems[0].offsetHeight;
    let targetIndex = 0;

    for (let i = 0; i < taskItems.length; i++) {
        const taskItemRect = taskItems[i].getBoundingClientRect();
        const boxMiddleY = taskItemRect.top + boxHeight / 2;

        if (y < boxMiddleY) {
            targetIndex = i;
            break;
        }
    }

    return targetIndex;
}

function drop(event) {
    event.preventDefault();
    const draggedTask = document.querySelector('.dragging');
    event.currentTarget.appendChild(draggedTask);
    draggedTask.classList.remove('dragging');
    saveTasksToLocalStorage();
}

document.addEventListener('dragend', function(event) {
    if (event.target.tagName === 'LI') {
        event.target.classList.remove('dragging');
    }
});