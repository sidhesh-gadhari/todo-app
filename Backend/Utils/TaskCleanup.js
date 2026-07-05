const cron = require('node-cron');
const User = require('../Models/User.models.js');
const Task = require('../Models/Tasks.models.js');
const { google } = require('googleapis');

// Quick helper to build client instances inside the automated background worker
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

const InitTaskCleanup = () => {
   cron.schedule('0 0 * * *', async () => {
      try {
         console.log("⚙️ Running Automatic Database Cleanup Job...");

         // 1. CLEANUP: Clear out unverified users older than 24 hours
         const userThresholdDate = new Date();
         userThresholdDate.setHours(userThresholdDate.getHours() - 24);

         const unverifiedUsersReport = await User.deleteMany({
            isVerified: false,
            createdAt: { $lt: userThresholdDate }
         });
         console.log(`✨ Cleanup Successful! Deleted ${unverifiedUsersReport.deletedCount} unverified users.`);

         // 2. GOOGLE CALENDAR SYNCED CLEANUP: Handle expired entries carefully
         const thresholdDate = new Date();
         thresholdDate.setDate(thresholdDate.getDate() - 3);
         const thresholdStr = thresholdDate.toISOString().split('T')[0];

         // Find all documents matching the expiration barrier and populate their parent profiles
         const expiredTasks = await Task.find({ dueDate: { $lt: thresholdStr } }).populate('user');

         for (const task of expiredTasks) {
             // Agar task ke paas valid Google Calendar tracker map link hai, usey wahan se wipe out karo
             if (task.googleEventId && task.user && task.user.googleCredentials?.access_token) {
                 try {
                     const calendar = getCalendarClient(task.user);
                     await calendar.events.delete({
                         calendarId: 'primary',
                         eventId: task.googleEventId
                     });
                 } catch (calErr) {
                     // Soft failure protection: Agar user ne app access revoke kar diya ho, to cron crash na ho
                     console.error(`⚠️ Midnight background cleanup skipped for event ${task.googleEventId}:`, calErr.message);
                 }
             }
         }

         // 3. DATABASE PURGE: Ab tasks ko database se safely clear kar do
         const deletionReport = await Task.deleteMany({
            dueDate: { $lt: thresholdStr }
         });
         console.log(`✨ Cleanup Successful! Deleted ${deletionReport.deletedCount} expired tasks from MongoDB.`);
      }
      catch (e) {
         console.error("❌ Error in automatic task cleanup cron job:", e.message);
      }
   });
};

module.exports = InitTaskCleanup;