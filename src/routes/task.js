const express = require('express');
const Task = require('../models/task.js');
const { authMiddleware, checkTaskListMiddleware, checkTaskMiddleware }
    = require('../middleware/middleware.js');

const taskRouter = express.Router();

taskRouter.post('/api/tasks/:listId', authMiddleware, checkTaskListMiddleware, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            list: req.params.listId,
            owner: req.user._id
        });

        const taskList = await Task.find({ list: task.list, owner: task.owner });

        taskList.sort((a, b) => a.position - b.position);

        if (!task.position || task.position > taskList.length + 1) {
            task.position = taskList.length + 1;
        } else {
            for (let i = 0; i < taskList.length; i++) {
                if (taskList[i].position === task.position) {
                    for (let j = i; j < taskList.length; j++) {
                        taskList[j].position++;
                        await taskList[j].save();
                    }
                    break;
                }
            }
        }

        await task.save();
        res.status(200).send({
            message: 'task saved succesfully'
        });

    } catch (error) {
        console.error(error.message);
        res.status(400).send({ message: error.message });
    }

});

taskRouter.get('/api/tasks/:listId', authMiddleware, checkTaskListMiddleware, async (req, res) => {
    try {

        const taskList = req.taskList;

        await taskList.populate('tasks');
        taskList.tasks.sort((a, b) => a.position - b.position);
        res.status(200).send(taskList.tasks.map(task => {
            return {
                _id: task._id,
                title: task.title,
                status: task.status,
                position: task.position
            }
        }));

    } catch (error) {
        console.error(error);
        res.status(400).send({ message: error.message });
    }

});

taskRouter.patch('/api/tasks/status/:taskId', authMiddleware, checkTaskMiddleware, async (req, res) => {
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => ['status'].includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ message: 'Invalid updates' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.taskId, owner: req.user._id });

        if (!task) {
            return res.status(404).send({ message: 'Task not found' });
        }

        task.status = req.body.status
        await task.save();
        res.status(200).send({
            message: 'Task status change succesfully',
            task: {
                _id: task._id,
                title: task.title,
                status: task.status,
                position: task.position
            }
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message });
    }
});

taskRouter.delete('/api/tasks/task/:taskId', authMiddleware, checkTaskMiddleware, async (req, res) => {

    try {

        const task =
            await Task.findOne({ _id: req.params.taskId, owner: req.user._id });

        const deletedTask = await task.remove();
        if (!deletedTask) return res.status(404).send({ message: 'Task not found' });

        const taskList = await Task.find({ list: task.list, owner: task.owner });

        taskList.sort((a, b) => a.position - b.position);

        if (task.position !== taskList.length) {
            for (let i = task.position - 1; i < taskList.length; i++) {
                taskList[i].position--;
                await taskList[i].save();
            }
        }

        res.status(200).send({
            message: 'Task deleted succesfully',
            deletedTask: deletedTask
        });

    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message });
    }

});

taskRouter.patch('/api/tasks/task/:taskId', authMiddleware, checkTaskMiddleware, async (req, res) => {
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => ['title', 'position'].includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ message: 'Invalid updates' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.taskId, owner: req.user._id });

        if (!task) {
            return res.status(404).send({ message: 'Task not found' });
        }

        if (req.body.title) task.title = req.body.title;

        const taskList = await Task.find({ list: task.list, owner: task.owner });

        taskList.sort((a, b) => a.position - b.position);

        if (req.body.position || req.body.position !== task.position) {
            if (req.body.position > task.position) {
                if (req.body.position >= taskList.length) {
                    for (let i = task.position; i < taskList.length; i++) {
                        taskList[i].position--;
                        await taskList[i].save();
                    }
                    task.position = taskList.length;
                } else {
                    for (let i = task.position; i < req.body.position; i++) {
                        taskList[i].position--;
                        await taskList[i].save();
                    }

                    task.position = req.body.position;
                }
            } else {
                for (let i = req.body.position - 1; i < task.position; i++) {
                    taskList[i].position++;
                    await taskList[i].save();
                }
                task.position = req.body.position;
            }
        }

        await task.save();
        res.status(200).send({
            message: 'Task edited change succesfully',
            task: {
                _id: task._id,
                title: task.title,
                status: task.status,
                position: task.position
            }
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message });
    }
});

module.exports = taskRouter;

