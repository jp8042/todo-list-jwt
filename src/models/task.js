const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true,
        default: false
    },
    list: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'TaskList'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    position: {
        type: Number,
    }
});

module.exports = mongoose.model('Task', taskSchema, 'Task');