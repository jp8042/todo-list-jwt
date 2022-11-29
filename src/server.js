const express = require('express');
const morgan = require('morgan');
const { init } = require('./common/datastore');
const taskRouter = require('./routes/task.js');
const taskListRouter = require('./routes/taskList.js');
const userRouter = require('./routes/user.js');

init();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(morgan('combined'));

app.use(taskRouter);
app.use(taskListRouter);
app.use(userRouter);

app.listen(port, () => console.log('server is running on localhost port ' + port));
