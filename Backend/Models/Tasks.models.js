const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
    {
     user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
     }, 
     isCompleted : {
        type: Boolean,
        required: true,
        default: false
     },
     taskName : {
        type: String,
        required: true,
        index: true
     },
     taskDuration : {
        type: String,
        required: true,
        default: "Default"
     },
     dueDate : {
        type: String,
        required: true
     },
     taskTime: {
      type: String,
      required: true
     },
     isMonthly: {
      type: Boolean,
      required: true,
      default: false
     },
     priority : {
        type: Boolean,
        required: true,
        default: false
     },
     googleEventId: {
        type: String,
        default: null
     }   
    },
    {
     timestamps: true   
    }
);

module.exports = mongoose.model("Task", TaskSchema);