const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/user.js');
const TaskList = require('../models/taskList.js');
const Task = require('../models/task.js');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const userId = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        req.user = await User.findOne({ _id: userId, 'tokens.token': token });
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send({ message: 'Unauthorized' });
    }
}

const checkTaskListMiddleware = async (req, res, next) => {
    try {
        if (!req.params.listId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Task list does not exist');

        const taskList = await TaskList.findOne({ _id: req.params.listId });
        if (!taskList) throw new Error('Task list does not exist');

        if (taskList.owner._id.toString() !== req.user._id.toString()) {
            throw new Error('You are not allowed to get this list');
        }
        req.taskList = taskList;
        next();
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message });
    }
}

const checkTaskMiddleware = async (req, res, next) => {
    try {
        if (!req.params.taskId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Task does not exist');
        const task = await Task.findOne({ _id: req.params.taskId });
        if (!task) throw new Error('Task does not exist');

        if (task.owner._id.toString() !== req.user._id.toString()) {
            throw new Error('You are not allowed to get this task');
        }
        req.task = task;
        next();
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message });
    }
}

module.exports = { authMiddleware, checkTaskListMiddleware, checkTaskMiddleware };