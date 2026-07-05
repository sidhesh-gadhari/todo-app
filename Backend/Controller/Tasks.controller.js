const Task = require('../Models/Tasks.models.js');
const User = require('../Models/User.models.js');
const asyncHandler = require('../Utils/AsyncHandler.js');
const ApiError = require('../Utils/ApiError.js');
const ApiResponse = require('../Utils/ApiResponse.js');
const { google } = require('googleapis');

const parseTaskDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    let [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    return new Date(year, month - 1, day, hours, minutes, 0);
};

// Helper to initialize Google Calendar client cleanly on demand
const getCalendarClient = (user) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CALLBACK_URL
    );
    oauth2Client.setCredentials({
        access_token: user.googleCredentials.access_token,
        refresh_token: user.googleCredentials.refresh_token
    });
    return google.calendar({ version: 'v3', auth: oauth2Client });
};

const AddTask = asyncHandler(async (req, res, next) => {
    const { isCompleted, taskName, taskDuration, dueDate, taskTime, isMonthly, priority } = req.body;
    if (taskName.trim() === "" || dueDate.trim() === "") {
        throw new ApiError(404, "All Fields Are Required!");   
    }

    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized Access!");   
    }
    
    const existingTask = await Task.findOne({ user: req.user._id, taskName: taskName });
    if (existingTask) {
        throw new ApiError(409, "Task With Same Name Already Exists!");   
    }

    const fullUser = await User.findById(req.user._id);
    let assignedCalendarEventId = null;

    // Google Calendar Sync Block
    if (fullUser && fullUser.googleCredentials?.access_token) {
        try {
            const calendar = getCalendarClient(fullUser);
            const startDateTime = parseTaskDateTime(dueDate, taskTime);
            const endDateTime = new Date(startDateTime.getTime() + (60 * 60 * 1000));

            const eventResource = {
                summary: taskName,
                description: `Priority Level: ${priority ? 'High' : 'Normal'} | Your Task Is Pending!`,
                start: { dateTime: startDateTime.toISOString(), timeZone: 'UTC' },
                end: { dateTime: endDateTime.toISOString(), timeZone: 'UTC' },
                reminders: { useDefault: false, overrides: [] }
            };

            if (taskDuration === 'Today') {
                eventResource.reminders.overrides.push({ method: 'popup', minutes: 180 }, { method: 'popup', minutes: 0 });
            } else if (taskDuration === 'Weekly') {
                eventResource.reminders.overrides.push({ method: 'popup', minutes: 4320 }, { method: 'popup', minutes: 1440 }, { method: 'popup', minutes: 180 }, { method: 'popup', minutes: 0 });
            } else if (taskDuration === 'Monthly' || taskDuration === 'Default') {
                eventResource.reminders.overrides.push({ method: 'popup', minutes: 10080 }, { method: 'popup', minutes: 4320 }, { method: 'popup', minutes: 1440 }, { method: 'popup', minutes: 180 }, { method: 'popup', minutes: 0 });
            }

            if (isMonthly) {
                const currentYear = new Date().getFullYear();
                eventResource.recurrence = [`RRULE:FREQ=MONTHLY;UNTIL=${currentYear}1231T235959Z`];
            }

            const googleResponse = await calendar.events.insert({
                calendarId: 'primary',
                resource: eventResource,
            });

            // Capture the real Google Event ID to track updates or deletions down the line
            assignedCalendarEventId = googleResponse.data.id;
        } catch (calendarError) {
            console.error("⚠️ [Google Calendar Sync Module Blocked]: ", calendarError.message);
        }
    }

    // Creating document with tracking ID attached
    const newTask = await Task.create({
        user: req.user._id,
        isCompleted, 
        taskName, 
        taskDuration, 
        dueDate, 
        taskTime,
        isMonthly,
        priority,
        googleEventId: assignedCalendarEventId // Saved cleanly inside MongoDB
    });

    if (!newTask) {
        throw new ApiError(500, "Task Was Not Created!");   
    }

    const allTasks = await Task.find({ user: req.user._id });
    return res.status(201).json(new ApiResponse(201, allTasks, "Task Was Created Successfully!"));
});

const GetTasks = asyncHandler(async (req, res, next) => {
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized Access!");
    }
    const specifiedUserTasks = await Task.find({ user: req.user._id }).sort({ updatedAt: -1 });
    return res.status(201).json(new ApiResponse(201, specifiedUserTasks, "Specified User's Tasks Fetched Successfully!"));
});

const setCompleted = asyncHandler(async (req, res, next) => {
    const { id, completionStatus } = req.body;
    if (!id) {
        throw new ApiError(400, "Task Id Is Required!");   
    }

    const task = await Task.findOne({ user: req.user._id, _id: id });
    if (!task) {
        throw new ApiError(404, "Task not found!");
    }

    const today = new Date();
    const currentRealMonth = today.getMonth() + 1; 
    const currentRealYear = today.getFullYear();

    // ==========================================================================
    // 🛡️ SECURITY BLOCK: MONTHLY RECURRING STALENESS LOCK
    // ==========================================================================
    if (task.isMonthly && completionStatus === true) {
        const [taskYear, taskMonth, taskDay] = task.dueDate.split('-').map(Number);

        if (taskMonth <= 11) {
            if (taskMonth > currentRealMonth && taskYear === currentRealYear) {
                throw new ApiError(
                    403, 
                    `Error: ${currentRealMonth}th month is Ongoing! You can't select this Monthly task now for the ${taskMonth}th month. Check dueDate carefully! ⚠️`
                );
            }
        }
    }

    let finalCompletionState = completionStatus;
    let finalDueDate = task.dueDate;

    // Google Cloud authorization flow checker
    if (task.googleEventId) {
        const fullUser = await User.findById(req.user._id);
        if (fullUser && fullUser.googleCredentials?.access_token) {
            try {
                const calendar = getCalendarClient(fullUser);
                
                if (task.isMonthly) {
                    // ==========================================================================
                    // GOOGLE CALENDAR RECURRING INSTANCE MANAGEMENT
                    // ==========================================================================
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
                    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59).toISOString();

                    const instancesRes = await calendar.events.instances({
                        calendarId: 'primary',
                        eventId: task.googleEventId,
                        timeMin: startOfMonth,
                        timeMax: endOfMonth,
                        maxResults: 1
                    });

                    const currentMonthInstance = instancesRes.data.items?.[0];

                    if (currentMonthInstance) {
                        if (completionStatus === true) {
                            // Instant Click Protection: Soft update with token name mapping
                            currentMonthInstance.summary = currentMonthInstance.summary.startsWith("✅ COMPLETED:") 
                                ? currentMonthInstance.summary 
                                : `✅ COMPLETED: ${currentMonthInstance.summary}`;
                            currentMonthInstance.reminders = { useDefault: false, overrides: [] }; 
                        } else {
                            // Accidental Click Recovery System: Restores default state if clicked mistakenly
                            currentMonthInstance.summary = currentMonthInstance.summary.replace("✅ COMPLETED: ", "");
                            currentMonthInstance.reminders = { useDefault: true }; 
                        }

                        await calendar.events.update({
                            calendarId: 'primary',
                            eventId: currentMonthInstance.id,
                            resource: currentMonthInstance
                        });
                    }

                    // ==========================================================================
                    // 🛡️ BACKGROUND PIPELINE: STALE 1-DAY CLEANUP ENGINE
                    // ==========================================================================
                    // Agar user 1 din baad check kar raha hai, toh safety ke liye purane triggers delete karo
                    const cutoffDate = new Date();
                    cutoffDate.setDate(cutoffDate.getDate() - 1); // Exact 1-Day offset threshold

                    const historicalInstances = await calendar.events.instances({
                        calendarId: 'primary',
                        eventId: task.googleEventId,
                        timeMax: cutoffDate.toISOString(),
                        maxResults: 10
                    });

                    if (historicalInstances.data.items?.length > 0) {
                        for (const oldInstance of historicalInstances.data.items) {
                            if (oldInstance.summary.startsWith("✅ COMPLETED:")) {
                                await calendar.events.delete({
                                    calendarId: 'primary',
                                    eventId: oldInstance.id
                                });
                                console.log(`🧹 [Safety Autoclean]: Stale event instance ${oldInstance.id} cleared.`);
                            }
                        }
                    }

                } else {
                    // Standard single event timeline sync
                    const currentEvent = await calendar.events.get({ calendarId: 'primary', eventId: task.googleEventId });

                    if (completionStatus === true) {
                        currentEvent.data.summary = currentEvent.data.summary.startsWith("✅ COMPLETED:") 
                            ? currentEvent.data.summary 
                            : `✅ COMPLETED: ${currentEvent.data.summary}`;
                        currentEvent.data.reminders = { useDefault: false, overrides: [] }; 
                    } else {
                        currentEvent.data.summary = currentEvent.data.summary.replace("✅ COMPLETED: ", "");
                        currentEvent.data.reminders = { useDefault: true }; 
                    }

                    await calendar.events.update({
                        calendarId: 'primary',
                        eventId: task.googleEventId,
                        resource: currentEvent.data
                    });
                }
            } catch (calendarError) {
                console.error("⚠️ [Calendar Core Sync Interrupted]: ", calendarError.message);
            }
        }
    }

    // ==========================================================================
    // 🔄 AUTOMATED ROLLING DATABASE ENGINE
    // ==========================================================================
    if (task.isMonthly && completionStatus === true) {
        const [currentYear, currentMonth, currentDay] = task.dueDate.split('-').map(Number);
        
        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;

        if (nextMonth > 12) {
            nextMonth = 1;
            nextYear = currentYear + 1;
        }

        const paddedMonth = nextMonth < 10 ? `0${nextMonth}` : nextMonth;
        const paddedDay = currentDay < 10 ? `0${currentDay}` : currentDay;
        
        finalDueDate = `${nextYear}-${paddedMonth}-${paddedDay}`;
        finalCompletionState = false; // Reset to false for incoming rolling periods
        
        res.setHeader("X-Task-Rolling", "true");
    } else {
        finalCompletionState = completionStatus;
    }

    task.isCompleted = finalCompletionState;
    task.dueDate = finalDueDate;
    await task.save();

    const responseMessage = (task.isMonthly && completionStatus === true)
        ? `Task rolling active! Current period verified cleanly, target shifted to ${finalDueDate}! 🚀`
        : "Task Completion Updated!";

    return res.status(200).json(new ApiResponse(200, task, responseMessage));
});

const setPriority = asyncHandler(async (req, res, next) => {
    if (!req.user._id) {
        throw new ApiError(401, "Unauthorized Access!");   
    }

    const { id, priorityStatus } = req.body;
    if (!id) {
        throw new ApiError(400, "Task Id Is Required!");   
    }

    const task = await Task.findOne({ user: req.user._id, _id: id });
    if (!task) {
        throw new ApiError(404, "Task not found!");
    }

    const nextPriorityState = !priorityStatus;

    // CHANGED: Sync priority meta strings straight back to Google descriptions
    if (task.googleEventId) {
        const fullUser = await User.findById(req.user._id);
        if (fullUser && fullUser.googleCredentials?.access_token) {
            try {
                const calendar = getCalendarClient(fullUser);
                
                // Fetch the event first to avoid overwriting dates/times blindly
                const currentEvent = await calendar.events.get({ calendarId: 'primary', eventId: task.googleEventId });
                
                currentEvent.data.description = `Priority Level: ${nextPriorityState ? 'High' : 'Normal'} | Your Task Is Pending!`;
                
                await calendar.events.update({
                    calendarId: 'primary',
                    eventId: task.googleEventId,
                    resource: currentEvent.data
                });
            } catch (e) {
                console.error("⚠️ [Calendar Priority Sync Failure]: ", e.message);
            }
        }
    }

    task.priority = nextPriorityState;
    await task.save();

    return res.status(200).json(new ApiResponse(200, task, "Task Priority Updated!"));
});

const deleteTask = asyncHandler(async (req, res, next) => {
    if (!req.user._id) {
        throw new ApiError(401, "Unauthorized Access!");   
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
        throw new ApiError(404, "Task Not Found!");
    }

    // CHANGED: Wipe from Google Calendar on individual deletion triggers
    if (task.googleEventId) {
        const fullUser = await User.findById(req.user._id);
        if (fullUser && fullUser.googleCredentials?.access_token) {
            try {
                const calendar = getCalendarClient(fullUser);
                await calendar.events.delete({ calendarId: 'primary', eventId: task.googleEventId });
            } catch (e) {
                console.error("⚠️ [Calendar Delete Sync Failure]: ", e.message);
            }
        }
    }

    await Task.findByIdAndDelete(req.params.id);
    const newTasks = await Task.find({ user: req.user._id }).sort({ updatedAt: -1 });

    return res.status(200).json(new ApiResponse(200, newTasks, "Task Deleted Successfully!"));
});

const deleteAllTasksForSpecificUser = asyncHandler(async (req, res, next) => {
    if (!req.user._id) {
        throw new ApiError(401, "Unauthorized Access!");   
    }

    // CHANGED: Fetch user's active tasks to check for Google event keys before running any database purges
    const userTasks = await Task.find({ user: req.user._id });
    const fullUser = await User.findById(req.user._id);

    if (fullUser && fullUser.googleCredentials?.access_token) {
        try {
            const calendar = getCalendarClient(fullUser);
            
            // Loop through and delete each synced calendar instance in the background safely
            for (const task of userTasks) {
                if (task.googleEventId) {
                    try {
                        await calendar.events.delete({ calendarId: 'primary', eventId: task.googleEventId });
                    } catch (singleEventErr) {
                        console.error(`⚠️ Failed to remove event ${task.googleEventId}:`, singleEventErr.message);
                    }
                }
            }
        } catch (e) {
            console.error("⚠️ [Calendar Mass Wipe Aborted]: ", e.message);
        }
    }

    // Database is safely cleared out once the external cleanups complete
    const allDeletedTasks = await Task.deleteMany({ user: req.user._id });
    if (!allDeletedTasks) {
        throw new ApiError(500, "Server Problem!");  
    }

    return res.status(200).json(new ApiResponse(200, [], "All Tasks Purged Successfully Everywhere!"));
});

module.exports = { AddTask, GetTasks, setCompleted, setPriority, deleteTask, deleteAllTasksForSpecificUser, getCalendarClient };