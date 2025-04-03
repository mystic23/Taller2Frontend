

document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3001/tasks';
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterButtons = {
      all: document.getElementById('showAll'),
      completed: document.getElementById('showCompleted'),
      pending: document.getElementById('showPending')
    };
    const sortTasksBtn = document.getElementById('ordenados');
    let tasks = [];
    let currentFilter = 'all';
  
    // Initialize app
    init();
  
    // Event listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addTask();
    });
  
    sortTasksBtn.addEventListener('click', sortTasks)

    Object.entries(filterButtons).forEach(([filter, button]) => {
      button.addEventListener('click', () => setFilter(filter));
    });
  
    // Functions
    async function init() {
      await loadTasks();
      renderTasks();
      loadFilterFromLocalStorage();
    }
  
    async function loadTasks() {
      try {
        const response = await fetch(`${API_URL}?filter=${currentFilter}`);
        if (response.ok) {
          tasks = await response.json();
          saveTasksToLocalStorage();
        } else {
          loadTasksFromLocalStorage();
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        loadTasksFromLocalStorage();
      }
    }
  
    async function addTask() {
      const title = taskInput.value.trim();
      if (!title) return;
  
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title })
        });
  
        if (response.ok) {
          const newTask = await response.json();
          tasks.unshift(newTask);
          renderTasks();
          saveTasksToLocalStorage();
          taskInput.value = '';
        }
      } catch (error) {
        console.error('Failed to add task:', error);
        const newTask = {
          id: Date.now(),
          title,
          completed: false,
          createdAt: new Date().toISOString()
        };
        tasks.unshift(newTask);
        renderTasks();
        saveTasksToLocalStorage();
        taskInput.value = '';
      }
    }
  
    async function toggleTaskCompletion(taskId) {
      try {
        const response = await fetch(`${API_URL}/${taskId}/toggle`, {
          method: 'PATCH'
        });
  
        if (response.ok) {
          const updatedTask = await response.json();
          const taskIndex = tasks.findIndex(t => t.id === taskId);
          if (taskIndex !== -1) {
            tasks[taskIndex] = updatedTask;
          }
          renderTasks();
          saveTasksToLocalStorage();
        }
      } catch (error) {
        console.error('Failed to toggle task:', error);
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          task.completed = !task.completed;
          renderTasks();
          saveTasksToLocalStorage();
        }
      }
    }
  
    async function editTask(taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
  
      const newTitle = prompt('Edit task:', task.title);
      if (newTitle === null || newTitle.trim() === '') return;
  
      try {
        const response = await fetch(`${API_URL}/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: newTitle.trim() })
        });
  
        if (response.ok) {
          const updatedTask = await response.json();
          const taskIndex = tasks.findIndex(t => t.id === taskId);
          if (taskIndex !== -1) {
            tasks[taskIndex] = updatedTask;
          }
          renderTasks();
          saveTasksToLocalStorage();
        }
      } catch (error) {
        console.error('Failed to edit task:', error);
        task.title = newTitle.trim();
        renderTasks();
        saveTasksToLocalStorage();
      }
    }
  
    async function deleteTask(taskId) {
      if (!confirm('Are you sure you want to delete this task?')) return;
  
      try {
        const response = await fetch(`${API_URL}/${taskId}`, {
          method: 'DELETE'
        });
  
        if (response.ok) {
          tasks = tasks.filter(t => t.id !== taskId);
          renderTasks();
          saveTasksToLocalStorage();
        }
      } catch (error) {
        console.error('Failed to delete task:', error);
        tasks = tasks.filter(t => t.id !== taskId);
        renderTasks();
        saveTasksToLocalStorage();
      }
    }
    

    
    function setFilter(filter) {
      currentFilter = filter;
      updateFilterButtons();
      renderTasks();
      saveFilterToLocalStorage();
    }
  
    function updateFilterButtons() {
      Object.keys(filterButtons).forEach(filter => {
        filterButtons[filter].classList.toggle('active', filter === currentFilter);
      });
    }
  
    function renderTasks() {
      taskList.innerHTML = '';
  
      const filteredTasks = currentFilter === 'all' 
        ? tasks 
        : tasks.filter(task => 
            currentFilter === 'completed' ? task.completed : !task.completed
          );
  
      if (filteredTasks.length === 0) {
        taskList.innerHTML = '<li class="empty-message">No tasks found</li>';
        return;
      }
  
      filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
  
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
  
        const titleSpan = document.createElement('span');
        titleSpan.className = 'task-title';
        titleSpan.textContent = task.title;
        if (task.completed) {
          titleSpan.classList.add('completed');
        }
  
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
  
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editTask(task.id));
  
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
  
        actionsDiv.append(editBtn, deleteBtn);
        taskItem.append(checkbox, titleSpan, actionsDiv);
        taskList.appendChild(taskItem);
      });
    }
  
    function sortTasks(){
      tasks.sort((a,b)=>{
        return new Date(a.createdAt)- new Date(b.createdAt);
      })
      renderTasks();
    }
    // LocalStorage functions
    function saveTasksToLocalStorage() {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  
    function loadTasksFromLocalStorage() {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        tasks = JSON.parse(savedTasks);
      }
    }
  
    function saveFilterToLocalStorage() {
      localStorage.setItem('taskFilter', currentFilter);
    }
  
    function loadFilterFromLocalStorage() {
      const savedFilter = localStorage.getItem('taskFilter');
      if (savedFilter) {
        currentFilter = savedFilter;
        updateFilterButtons();
      }
    }
  });