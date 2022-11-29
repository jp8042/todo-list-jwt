const mongoose = require('mongoose');
const Task = require('./task.js');

const taskListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

taskListSchema.pre('remove', async function (next) {
    const taskList = this;
    await Task.deleteMany({ list: taskList._id });
    next();
})

taskListSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'list'
});

module.exports = mongoose.model('TaskList', taskListSchema, 'TaskList');