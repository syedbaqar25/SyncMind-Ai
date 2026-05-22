const express = require('express');
const taskController = require('../controllers/task.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { taskListSchema, taskIdSchema, updateTaskSchema } = require('../validators/task.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', validate(taskListSchema), taskController.listTasks);
router.get('/my-tasks', taskController.myTasks);
router.get('/overdue', validate(taskListSchema), taskController.overdueTasks);
router.put('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', validate(taskIdSchema), taskController.deleteTask);

module.exports = router;
