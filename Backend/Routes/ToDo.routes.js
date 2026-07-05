const express = require('express');
const passport = require('passport');
const { Signup, Login, Logout, refreshUserToken, getSessionUser, getCurrentUser, GoogleAuthCallbackController, verifyAccount, deleteUser } = require('../Controller/Auth.controller.js');
const { authMiddleware, validateSignup } = require('../Middleware/Auth.middleware.js');
const { AddTask, GetTasks, setCompleted, setPriority, deleteTask, deleteAllTasksForSpecificUser } = require('../Controller/Tasks.controller.js');
const router = express.Router();

router.route("/").post(validateSignup, Signup);
router.route("/login").post(Login);
router.route("/refresh-token").post(refreshUserToken);
router.route("/session").get(getSessionUser);
router.route("/verify-account").get(verifyAccount);

router.get('/auth/google',
    passport.authenticate('google', 
        { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.events'],
        accessType: 'offline', 
        prompt: 'consent',
        session: false })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login' }),
    GoogleAuthCallbackController
);

router.use(authMiddleware);
router.route("/current-user").get(getCurrentUser);
router.route("/logout").post(Logout);
router.route("/add-task").post(AddTask);
router.route("/get-tasks").get(GetTasks);
router.route("/update-completion").patch(setCompleted);
router.route("/update-priority").patch(setPriority);
router.route("/delete-task/:id").delete(deleteTask);
router.route("/delete-allTasks").delete(deleteAllTasksForSpecificUser);
router.route("/delete-user/:id").delete(deleteUser);

module.exports = router;