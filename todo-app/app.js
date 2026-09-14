// To-Do List Application with Local Storage

class TodoApp {
    constructor() {
        this.todos = this.loadFromLocalStorage();
        this.currentFilter = 'all';
        this.initElements();
        this.attachEventListeners();
        this.render();
    }

    // Initialize DOM elements
    initElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.clearBtn = document.getElementById('clearBtn');
        this.todoCount = document.getElementById('todoCount');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    // Attach event listeners
    attachEventListeners() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.clearBtn.addEventListener('click', () => this.clearCompleted());
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
    }

    // Add a new todo
    addTodo() {
        const text = this.todoInput.value.trim();

        if (text === '') {
            this.showNotification('Please enter a task!');
            return;
        }

        if (text.length > 200) {
            this.showNotification('Task is too long (max 200 characters)');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString()
        };

        this.todos.unshift(todo);
        this.todoInput.value = '';
        this.todoInput.focus();
        this.saveToLocalStorage();
        this.render();
        this.showNotification('Task added successfully!');
    }

    // Delete a todo
    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToLocalStorage();
        this.render();
        this.showNotification('Task deleted!');
    }

    // Toggle todo completion
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.render();
        }
    }

    // Clear all completed todos
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('No completed tasks to clear!');
            return;
        }

        if (confirm(`Delete ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveToLocalStorage();
            this.render();
            this.showNotification('Completed tasks cleared!');
        }
    }

    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    // Get filtered todos
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    // Render the todo list
    render() {
        const filteredTodos = this.getFilteredTodos();
        this.todoList.innerHTML = '';

        if (filteredTodos.length === 0) {
            this.todoList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-emoji">📭</div>
                    <p>${this.getEmptyMessage()}</p>
                </div>
            `;
        } else {
            filteredTodos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                li.innerHTML = `
                    <input
                        type="checkbox"
                        class="checkbox"
                        ${todo.completed ? 'checked' : ''}
                        onchange="app.toggleTodo(${todo.id})"
                    />
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">Delete</button>
                `;
                this.todoList.appendChild(li);
            });
        }

        this.updateStats();
    }

    // Update statistics
    updateStats() {
        const totalTodos = this.todos.length;
        const activeTodos = this.todos.filter(t => !t.completed).length;
        const completedTodos = this.todos.filter(t => t.completed).length;

        let statsText = '';
        if (this.currentFilter === 'all') {
            statsText = `${totalTodos} task${totalTodos !== 1 ? 's' : ''}`;
        } else if (this.currentFilter === 'active') {
            statsText = `${activeTodos} active task${activeTodos !== 1 ? 's' : ''}`;
        } else {
            statsText = `${completedTodos} completed task${completedTodos !== 1 ? 's' : ''}`;
        }

        this.todoCount.textContent = statsText;
        this.clearBtn.disabled = completedTodos === 0;
    }

    // Get empty state message
    getEmptyMessage() {
        switch (this.currentFilter) {
            case 'active':
                return 'No active tasks! You are all caught up. 🎉';
            case 'completed':
                return 'No completed tasks yet. Get working! 💪';
            default:
                return 'No tasks yet. Add one to get started! ✨';
        }
    }

    // Save todos to local storage
    saveToLocalStorage() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('Error saving to local storage:', error);
            this.showNotification('Error saving task!', 'error');
        }
    }

    // Load todos from local storage
    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('todos');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading from local storage:', error);
            return [];
        }
    }

    // Show notification
    showNotification(message, type = 'success') {
        // Create a simple notification (you can enhance this)
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
});