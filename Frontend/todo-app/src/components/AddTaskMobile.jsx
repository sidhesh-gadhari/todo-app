import React, { useState, useEffect } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Timepicker } from 'timepicker-ui-react';
import "timepicker-ui/main.css";
import './AddTask.css';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const AddTaskMobile = () => {
    const [task, setTask] = useState("");
    const [deadline, setDeadline] = useState("Default");
    const [deadlineDate, setDeadlineDate] = useState("");
    const [taskTime, setTaskTime] = useState("");
    const [adding, setAdding] = useState(false);

    const { AddTask, theme } = useAuth();
    const nav = useNavigate();

    useEffect(() => {
        const now = new Date();
        if (deadline === "Today") {
            setDeadlineDate(now);
        }
        else {
            setDeadlineDate("");
        }
    }, [deadline]);

    useEffect(() => {
        document.body.className = theme === 'light' ? 'light-mode' : '';
    }, [theme]);

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

        return new Date(currentYear, 11, 31);
    }

    const addTask = () => {
        if (task.trim() === "" || !deadline) {
            toast.dismiss();
            return toast.error("All Fields Are Required!");
        }

        let formattedDate = "";
        if (deadline) {
            const offset = deadlineDate.getTimezoneOffset();
            const localDate = new Date(deadlineDate.getTime() - (offset * 60 * 1000));
            formattedDate = localDate.toISOString().split('T')[0];
        }

        const data = { isCompleted: false, taskName: task.trim(), taskDuration: deadline, dueDate: formattedDate, taskTime, priority: false };
        setAdding(true);
        AddTask(data)
            .then((response) => {
                setTask("");
                setDeadline("Default");
                setDeadlineDate("");
                setTaskTime("");
                nav('/dashboard');
                toast.dismiss();
                toast.success("Task Added Successfully! ✅");
            })
    }

    return (
        <div className={`add-task-page-wrapper ${theme === 'light' ? 'light-mode' : ''}`}>
            <div className="add-task-header">
                <Link to="/dashboard" className="back-button">
                    <IoArrowBack size={24} />
                </Link>
                <h2>New Task</h2>
            </div>

            <form className="add-task-form">
                <div className="form-group">
                    <label>Task Description</label>
                    <input value={task} type="text" placeholder="What needs to be done today?" className="add-task-input" onChange={(e) => { setTask(e.target.value) }} />
                </div>

                <div className="form-group">
                    <label>Timeframe</label>
                    <select value={deadline} className="add-task-select" onChange={(e) => { setDeadline(e.target.value) }}>
                        <option value="Default">Default</option>
                        <option value="Today">Today</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Due Date</label>
                    <DatePicker
                        selected={deadlineDate}
                        onChange={(date) => { setDeadlineDate(date) }}
                        minDate={new Date()}
                        maxDate={deadline === "Today" ? new Date() : getMaxDateForPicker()}
                        disabled={deadline === "Today"}
                        placeholderText={deadline === "Today" ? "Locked to Today" : "Set Due Date"}
                        className="custom-datepicker-input"
                        dateFormat="yyyy-MM-dd"
                    />
                </div>

                <div className="form-group">
                    <label>Deadline Time</label>
                    <Timepicker
                        value={taskTime}
                        className="add-task-input custom-time-picker-input"
                        placeholder="Set Time"
                        options={timePickerOptions}
                        onConfirm={handleTimeConfirm}
                        onClear={() => setTaskTime("")}
                        readOnly
                    />
                </div>

                <div className="form-group add-task-checkbox-group">
                    <input 
                        type="checkbox" 
                        id="monthlyRepeat" 
                        className="add-task-checkbox" 
                        disabled={deadline !== "Monthly"} 
                    />
                    <label htmlFor="monthlyRepeat" className="add-task-checkbox-label">
                        Set for every month till year end
                    </label>
                </div>

                <button onClick={addTask} type="button" className="save-task-btn">{adding ? "Adding..." : "Add Task"}</button>
            </form>
        </div>
    );
};

export default AddTaskMobile;