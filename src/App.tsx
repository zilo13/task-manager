import { useState, useEffect } from 'react'
import './App.css'

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  completed: boolean
  createdAt: string
}

type FilterType = 'all' | 'active' | 'completed'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (error) {
        console.error('Failed to load tasks:', error)
      }
    }
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      alert('Please enter a task title')
      return
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setTasks([newTask, ...tasks])
    resetForm()
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const getFilteredTasks = () => {
    switch (filter) {
      case 'active':
        return tasks.filter(task => !task.completed)
      case 'completed':
        return tasks.filter(task => task.completed)
      default:
        return tasks
    }
  }

  const filteredTasks = getFilteredTasks()
  const completedCount = tasks.filter(t => t.completed).length
  const activeCount = tasks.filter(t => !t.completed).length
  const totalCount = tasks.length

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const isOverdue = (dueDate: string, completed: boolean) => {
    if (!dueDate || completed) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <>
      <header className="header">
        <div className="header-content">
          <h1>✓ Task Manager</h1>
          <p>Stay organized and boost your productivity</p>
        </div>
      </header>

      <div className="container">
        {/* Stats Section */}
        <div className="stats">
          <div className="stat-card">
            <div className="stat-value">{totalCount}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Active Tasks</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{completedCount}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        {/* Task Input Form */}
        <form className="task-form" onSubmit={addTask}>
          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              id="title"
              type="text"
              placeholder="Enter your task..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Add more details (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              <i className="fas fa-plus"></i> Add Task
            </button>
            <button type="button" className="btn-clear" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        {/* Tasks Section */}
        <div className="tasks-section">
          <h2>Your Tasks</h2>

          {/* Filter Buttons */}
          {totalCount > 0 && (
            <div className="filter-buttons">
              <button
                className={`btn-filter ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({totalCount})
              </button>
              <button
                className={`btn-filter ${filter === 'active' ? 'active' : ''}`}
                onClick={() => setFilter('active')}
              >
                Active ({activeCount})
              </button>
              <button
                className={`btn-filter ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed ({completedCount})
              </button>
            </div>
          )}

          {/* Tasks List */}
          {filteredTasks.length > 0 ? (
            <div className="tasks-list">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-item ${task.completed ? 'completed' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                  />

                  <div className="task-content">
                    <div className="task-title">{task.title}</div>
                    {task.description && (
                      <div className="task-description">{task.description}</div>
                    )}
                    <div className="task-meta">
                      <span className={`task-priority ${task.priority}`}>
                        <i className={`fas fa-circle-${task.priority === 'high' ? 'exclamation' : task.priority === 'medium' ? 'minus' : 'check'}`}></i>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      {task.dueDate && (
                        <span className={`task-duedate ${isOverdue(task.dueDate, task.completed) ? 'overdue' : ''}`}>
                          <i className="fas fa-calendar"></i>
                          {formatDate(task.dueDate)}
                          {isOverdue(task.dueDate, task.completed) && ' (Overdue)'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="task-actions">
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => deleteTask(task.id)}
                      aria-label={`Delete ${task.title}`}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-inbox"></i>
              </div>
              <h3>
                {totalCount === 0
                  ? 'No tasks yet'
                  : filter === 'completed'
                    ? 'No completed tasks'
                    : 'No active tasks'}
              </h3>
              <p>
                {totalCount === 0
                  ? 'Create your first task to get started!'
                  : 'Great job! Keep it up!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default App
