import React, { useEffect, useState } from 'react';
import { FaStar, FaRegStar, FaTrash } from "react-icons/fa";
import { FiMenu, FiX, FiFilter } from "react-icons/fi";
import { IoIosLogOut } from "react-icons/io";
import { IoSunnyOutline, IoMoonOutline, IoSettingsOutline } from "react-icons/io5";
import { FiPlus } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Timepicker } from 'timepicker-ui-react';
import "timepicker-ui/main.css";
import './ToDo.css';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

const Dashboard = () => {
    const [task, setTask] = useState("");
    const [deadline, setDeadline] = useState("Default");
    const [deadlineDate, setDeadlineDate] = useState("");
    const [taskTime, setTaskTime] = useState("");
    const [eachMonthly, setEachMonthly] = useState(false);
    const [adding, setAdding] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [taskList, setTaskList] = useState([]);
    const [search, setSearch] = useState("");
    const [currentFilter, setCurrentFilter] = useState("All");
    const [timeFrame, setTimeFrame] = useState("All");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isFabOpen, setIsFabOpen] = useState(false);

    const { user, AddTask, updateCompletion, updatePriority, deleteTask, deleteAllTasksForUser, api, theme } = useAuth();

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await api.get('/todo/get-tasks');
                setTaskList(Array.isArray(res.data.data) ? res.data.data : []);
            }
            catch {
                setTaskList([]);
            }
        }
        fetchNotes();
    }, [api]);

    useEffect(() => {
        document.body.className = theme === 'light' ? 'light-mode' : '';
    }, [theme]);

    useEffect(() => {
        const now = new Date();
        if (deadline === "Today") {
            setDeadlineDate(now);
        }
        else {
            setDeadlineDate("");
        }
    }, [deadline]);

    const timePickerOptions = {
        clock: {
            type: "12h",
            incrementMinutes: 1,
            autoSwitchToMinutes: true,
        },
        ui: {
            mode: "clock",
            theme: "m3-green",
            mobile: false,
        },
        labels: {
            time: "Select time",
            ok: "OK",
            cancel: "Cancel",
        },
    };

    const handleTimeConfirm = ({ hour, minutes, type }) => {
        if (!hour || !minutes) return;
        setTaskTime(`${hour}:${minutes} ${(type || "AM").toUpperCase()}`);
    };

    const addTask = () => {
        if (task.trim() === "" || !deadlineDate) {
            toast.dismiss();
            return toast.error("All Fields Are Required!");
        }
        if (task.length > 25) {
            toast.dismiss();
            return toast.error("Task Name Is Too Big!");
        }
        let formattedDate = "";
        if (deadlineDate) {
            const offset = deadlineDate.getTimezoneOffset();
            const localDate = new Date(deadlineDate.getTime() - (offset * 60 * 1000));
            formattedDate = localDate.toISOString().split('T')[0];
        }
        const data = { isCompleted: false, taskName: task.trim(), taskDuration: deadline, dueDate: formattedDate, taskTime: taskTime, taskTime, isMonthly: eachMonthly, priority: false };
        console.log(data);
        setAdding(true);
        AddTask(data)
            .then((response) => {
                setTaskList(response.data);
                setTask("");
                setDeadline("Default");
                setDeadlineDate("");
                setTaskTime("");
                toast.dismiss();
                toast.success("Task Added Successfully! ✅");
            })
            .catch(() => { })
            .finally(() => { setAdding(false) });
    }

    const updateCompletionStatus = (task) => {
        const data = { id: task._id, completionStatus: !task.isCompleted };
        setUpdating(true);
        updateCompletion(data)
            .then((response) => {
                if (!task.isCompleted) {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
                setTaskList((prevTasks) =>
                    prevTasks.map((t) => t._id === response.data._id ? response.data : t)
                );
            })
            .catch(() => { })
            .finally(() => { setUpdating(false) })
    }

    const updatePriorityStatus = (task) => {
        const data = { id: task._id, priorityStatus: task.priority };
        setUpdating(true);
        updatePriority(data)
            .then((response) => {
                setTaskList((prevTasks) =>
                    prevTasks.map((t) => t._id === response.data._id ? response.data : t)
                );
            })
            .catch(() => { })
            .finally(() => { setUpdating(false) })
    }

    const handleDelete = (id) => {
        setDeleting(true);
        deleteTask(id)
            .then((response) => {
                setTaskList(Array.isArray(response.data) ? response.data : []);
                toast.dismiss();
                toast.success("Task Deleted Successfully! 🗑️");
            })
            .catch(() => { })
            .finally(() => { setDeleting(false) })
    }

    const confirmDeleteAllTasks = () => {
        toast.dismiss();
        toast((t) => (
            <div className="custom-toast-confirmation">
                <p style={{ margin: "0 0 10px 0", fontWeight: "600", fontSize: "14px" }}>
                    Are you sure you want to clear all tasks?
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                        className="toast-confirm-btn text-green"
                        onClick={() => {
                            toast.dismiss(t.id);
                            deleteAllTasks();
                        }}
                    >
                        Yes, Clear
                    </button>
                    <button
                        className="toast-cancel-btn"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {
            duration: 6000,
            position: "top-center",
            style: {
                background: '#13111c',
                border: '1px solid #ef4444', /* Red Alert indicator boundary line */
                padding: '16px',
                borderRadius: '12px',
                color: '#fff',
                minWidth: '300px'
            }
        });
    };

    const deleteAllTasks = () => {
        setDeleting(true);
        deleteAllTasksForUser()
            .then((response) => {
                setTaskList(Array.isArray(response.data) ? response.data : []);
                toast.dismiss();
                toast.success("All Tasks Deleted Successfully! ");
            })
            .catch(() => { })
            .finally(() => { setDeleting(false) })
    }

    const getMaxDateForPicker = () => {
        const now = new Date();

        if (deadline === "Weekly") {
            const maxWeekly = new Date();
            maxWeekly.setDate(maxWeekly.getDate() + 7);
            return maxWeekly;
        }

        if (deadline === "Monthly") {
            return new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }

        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const targetYear = currentMonth >= 9 ? currentYear + 1 : currentYear;

        return new Date(targetYear, 11, 31);
    }

    const totalTasks = taskList.length;
    const completedTasks = taskList.filter((t) => t.isCompleted).length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className={`dashboard-root-wrapper ${theme === 'light' ? 'light-mode' : ''}`}>
            {/* Top Navigation Bar */}
            <nav className="main-navbar">
                <div className="nav-logo">Workspace // <b>{user.name ? user.name : user?.email.split('@')[0]}</b></div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button className="theme-toggle-btn" aria-label="Toggle Theme">
                        {theme === 'light' ? <IoSunnyOutline size={22} /> : <IoMoonOutline size={22} />}
                    </button>
                    <Link to="/settings" className="user-profile-badge"><IoSettingsOutline size={18} /> Settings</Link>
                </div>
            </nav>

            <div className="dashboard-grid-layout">
                {/* Left Sidebar: Controls & Stats */}
                <aside className="sidebar-controls">
                    <h2 className="sidebar-heading">Overview</h2>

                    <div className="stats-vertical-stack">
                        <div className="circular-progress-container">
                            <svg viewBox="0 0 36 36" className="circular-chart">
                                <path className="circle-bg"
                                    d="M18 2.0845
                                      a 15.9155 15.9155 0 0 1 0 31.831
                                      a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path className="circle"
                                    strokeDasharray={`${percentage}, 100`}
                                    d="M18 2.0845
                                      a 15.9155 15.9155 0 0 1 0 31.831
                                      a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <text x="18" y="20.35" className="percentage">{percentage}%</text>
                            </svg>
                        </div>
                        <div className="stat-card-item total-tasks">
                            <span className="stat-item-label">Total Tasks</span>
                            <span className="stat-item-value">{totalTasks}</span>
                        </div>
                        <div className="stat-card-item active-tasks">
                            <span className="stat-item-label">Active Tasks</span>
                            <span className="stat-item-value">{totalTasks - completedTasks}</span>
                        </div>
                        <div className="stat-card-item completed-tasks">
                            <span className="stat-item-label">Completed</span>
                            <span className="stat-item-value">{completedTasks}</span>
                        </div>
                    </div>

                    <div className="filter-navigation-box">
                        <span className="filter-section-title">Quick Filters</span>
                        <div className="filter-links-list">
                            <button className={`${currentFilter === "All" ? 'filter-link-btn active-link' : 'filter-link-btn'}`} onClick={(e) => { setCurrentFilter("All"); }}>All Tasks</button>
                            <button className={`${currentFilter === "Active" ? 'filter-link-btn active-link' : 'filter-link-btn'}`} onClick={(e) => { setCurrentFilter("Active"); }}>Active</button>
                            <button className={`${currentFilter === "Completed" ? 'filter-link-btn active-link' : 'filter-link-btn'}`} onClick={(e) => { setCurrentFilter("Completed"); }}>Completed</button>
                        </div>
                    </div>
                </aside>

                {/* Right Side: Task Board Operations */}
                <main className="task-board-area">
                    {/* Task Creation Form Card */}
                    <div className="task-creation-card">
                        {/* Block 1: Task Name and Deadline (1 Line) */}
                        <div className="form-inputs-row">
                            <input
                                value={task}
                                type="text"
                                id="missionInput"
                                placeholder="What needs to be done today?"
                                required
                                onChange={(e) => setTask(e.target.value)}
                            />
                            <div className="select-component-container">
                                <select value={deadline} className="custom-app-select" onChange={(e) => setDeadline(e.target.value)}>
                                    <option value="Default">Default</option>
                                    <option value="Today">Today</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                </select>
                            </div>
                        </div>

                        {/* Block 2: Deadline Date and Task Time (Next Line/Block) */}
                        <div className="form-inputs-row">
                            <div className="datepicker-component-container" style={{ flex: 1 }}>
                                <DatePicker
                                    selected={deadlineDate}
                                    onChange={(date) => setDeadlineDate(date)}
                                    minDate={new Date()}
                                    maxDate={deadline === "Today" ? new Date() : getMaxDateForPicker()}
                                    disabled={deadline === "Today"}
                                    placeholderText={deadline === "Today" ? "Locked to Today" : "Set Due Date"}
                                    className="custom-datepicker-input"
                                    dateFormat="yyyy-MM-dd"
                                />
                            </div>
                            <div className="timepicker-component-container" style={{ flex: 1 }}>
                                <Timepicker
                                    value={taskTime}
                                    className="custom-time-picker-input"
                                    placeholder="Set Time"
                                    options={timePickerOptions}
                                    onConfirm={handleTimeConfirm}
                                    onClear={() => setTaskTime("")}
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Block 3: Monthly Options (Next Line/Block) */}
                        <div className="form-inputs-row">
                            <div className="checkbox-component-container">
                                <input
                                    type="checkbox"
                                    id="repeatMonthlyDashboard"
                                    checked={eachMonthly}
                                    className="custom-app-checkbox"
                                    disabled={deadline !== "Monthly"}
                                    onChange={() => setEachMonthly(!eachMonthly)}
                                />
                                <label htmlFor="repeatMonthlyDashboard">
                                    Repeat till year end
                                </label>
                            </div>
                        </div>

                        {/* Form Action Buttons */}
                        <div className="form-actions-row">
                            <button id="addBtn" disabled={adding} onClick={addTask}>{adding ? "Adding..." : "Add Task"}</button>
                            <button id="clearBtn" disabled={deleting || taskList.length === 0} onClick={confirmDeleteAllTasks}>Clear All</button>
                        </div>
                    </div>

                    {/* Controls Center: Search and Time Filters */}
                    <div className="control-center-panel">
                        <div className="search-bar-container">
                            <input value={search} type="text" className="search-input" placeholder="Search tasks by name or date..." onChange={(e) => { setSearch(e.target.value) }} />

                            {/* Hamburger Menu Toggle (Mobile/Tablet Only) */}
                            <button
                                className="mobile-menu-toggle-btn"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <FiX size={22} /> : <FiFilter size={22} />}
                            </button>
                        </div>

                        {/* Time Frame Filter Dropdown */}
                        <div className="time-filter-container">
                            <span className="filter-dropdown-label">Timeframe:</span>
                            <select value={timeFrame} className="custom-filter-select" onChange={(e) => { setTimeFrame(e.target.value) }}>
                                <option value="All">All Time (Default)</option>
                                <option value="Today">Due Today</option>
                                <option value="Weekly">Due This Week</option>
                                <option value="Monthly">Due This Month</option>
                            </select>
                        </div>

                        {/* Hamburger Expandable Menu (Mobile/Tablet Only) */}
                        {isMobileMenuOpen && (
                            <div className="mobile-expandable-menu">
                                {/* Mobile Quick Filters */}
                                <div className="mobile-filters-group">
                                    <span className="mobile-filter-title">Task Status</span>
                                    <div className="mobile-filter-buttons">
                                        <button className={`mobile-filter-btn ${currentFilter === "All" ? 'active' : ''}`} onClick={() => { setCurrentFilter("All"); setIsMobileMenuOpen(false); }}>All</button>
                                        <button className={`mobile-filter-btn ${currentFilter === "Active" ? 'active' : ''}`} onClick={() => { setCurrentFilter("Active"); setIsMobileMenuOpen(false); }}>Active</button>
                                        <button className={`mobile-filter-btn ${currentFilter === "Completed" ? 'active' : ''}`} onClick={() => { setCurrentFilter("Completed"); setIsMobileMenuOpen(false); }}>Completed</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Task Stream Grid List */}
                    <div className="table-scroll-container">
                        <div className="table-overflow-wrapper">
                            <table className="tasks-display-card">
                                <thead className="grid-header-labels">
                                    <tr>
                                        <th className="label-col center-content">Status</th>
                                        <th className="label-col text-left flex-grow-col">Task Description</th>
                                        <th className="label-col center-content">Timeframe</th>
                                        <th className="label-col center-content">Due Date & Time</th>
                                        <th className="label-col center-content">Priority</th>
                                        <th className="label-col right-content">Action</th>
                                    </tr>
                                </thead>

                                {/* Task List Feed Stack */}
                                <tbody className="tasks-feed-stack">
                                    {/* Row Item 1 */}
                                    {taskList.filter((task) => {
                                        const query = search.toLowerCase();
                                        const matchesSearch = task.taskName.toLowerCase().includes(query) || task.dueDate.toLowerCase().includes(query);

                                        const matchesStatus =
                                            currentFilter === "All" ||
                                            (currentFilter === "Active" && !task.isCompleted) ||
                                            (currentFilter === "Completed" && task.isCompleted);

                                        const matchesTimeframe =
                                            timeFrame === "All" ||
                                            task.taskDuration === timeFrame;

                                        return matchesSearch && matchesStatus && matchesTimeframe;
                                    })
                                        .sort((a, b) => (a.dueDate - b.dueDate || b.priority - a.priority || a.isCompleted - b.isCompleted))
                                        .map((task) => {
                                            const todayStr = new Date().toISOString().split('T')[0];
                                            const isTaskExpired = task.dueDate < todayStr;
                                            return (
                                                <tr key={task._id} className={`task-data-row-card ${updating || deleting ? 'row-processing' : ''}`}>
                                                    <td className="cell-block center-content">
                                                        <input checked={task.isCompleted} type="checkbox" className="custom-app-checkbox" onChange={() => { !updating && updateCompletionStatus(task) }} />
                                                    </td>
                                                    <td className={`cell-block text-left flex-grow-col task-title-text ${task.isCompleted ? 'text-strike' : ''}`}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <span>{task.taskName}</span>
                                                            {task.isMonthly && <span style={{ fontSize: '0.7rem', color: '#c084fc', background: 'rgba(168, 85, 247, 0.1)', padding: '2px 6px', borderRadius: '4px', width: 'fit-content', textTransform: 'uppercase', fontWeight: 'bold' }}>Each Monthly</span>}
                                                        </div>
                                                    </td>
                                                    <td className="cell-block center-content timeframe-badge-cell">
                                                        <span className={`time-badge ${isTaskExpired ? 'expired-red' : task.taskDuration.toLowerCase()}`}>
                                                            {isTaskExpired ? "Expired" : task.taskDuration}
                                                        </span>
                                                    </td>
                                                    <td className="cell-block center-content task-date-value">
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                            <span>{task.dueDate}</span>
                                                            {task.taskTime && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{task.taskTime}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="cell-block center-content">
                                                        <span className={`${task.priority ? 'priority-starred star-active' : 'star-icon'}`} disabled={updating} onClick={() => { !updating && updatePriorityStatus(task) }}><FaStar /></span>
                                                    </td>
                                                    <td className="cell-block right-content">
                                                        <button className="action-delete-btn" onClick={() => { !deleting && handleDelete(task._id) }}><FaTrash /></button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                </tbody>
                            </table>
                        </div>
                        {taskList.length === 0 && (
                            <div className="empty-state-card-wrapper">
                                <div className="empty-state-vector-box">
                                    <div className="empty-state-pulse-ring">
                                        <svg className="fluid-check-vector" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <h3 className="empty-state-main-text">Nothing to do</h3>
                                    <p className="empty-state-sub-text">All clean! Time to rest or conquer a mission.</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <p className="note-for-deletion">Note : The Expired Tasks will be AUTOMATICALLY DELETED after 3 days if not deleted!</p>
                </main>
            </div>

            <div className={`mobile-fab-container ${isFabOpen ? 'fab-open' : ''}`}>
                <button className="fab-main-btn" onClick={() => setIsFabOpen(!isFabOpen)}>
                    <FiPlus className="fab-icon" />
                </button>
                <div className="fab-menu">
                    <Link to="/add-task"><button className="fab-menu-item" onClick={() => setIsFabOpen(false)}>Add Task</button></Link>
                    <button className="fab-menu-item clear-all" onClick={() => { setIsFabOpen(false); confirmDeleteAllTasks(); }}>Clear All</button>
                </div>
            </div>
        </div>
    )
};

export default Dashboard;