// src/pages/Tasks.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';          // <-- ใช้ instance กลาง
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError('');
      try {
        const res = await api.get('/api/tasks'); // แนบ token อัตโนมัติ
        if (!cancelled) setTasks(res.data || []);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || 'Failed to fetch tasks');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="container-page">
      <div className="mb-4">
        <h1 className="m-0">Tasks</h1>
        <p className="helper">Manage your tasks (list / add / edit / delete)</p>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 12, borderColor: '#fecaca', background: '#fff1f2' }}>
          <div className="card-body" style={{ color: '#991b1b' }}>{error}</div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">{editingTask ? 'Edit task' : 'Add task'}</div>
        <div className="card-body">
          <TaskForm
            tasks={tasks}
            setTasks={setTasks}
            editingTask={editingTask}
            setEditingTask={setEditingTask}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">Task list</div>
        <div className="card-body">
          {loading ? (
            <p className="helper">Loading tasks…</p>
          ) : (
            <TaskList tasks={tasks} setTasks={setTasks} setEditingTask={setEditingTask} />
          )}
        </div>
      </div>
    </div>
  );
}
