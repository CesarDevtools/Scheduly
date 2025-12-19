const express = require('express');
const router = express.Router();
const schedulesController = require('../../controllers/schedulesController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const { verifyOwnership, verifyManagementAccess } = require('../../middleware/verifyOwnership');

router.route('/')
    .get(verifyOwnership, schedulesController.getAllSchedules)
    .post(verifyManagementAccess, schedulesController.createNewSchedule)
    .put(verifyManagementAccess, schedulesController.updateSchedule)
    .delete(verifyManagementAccess, schedulesController.deleteSchedule);

router.route('/employee/:employeeId')
    .get(verifyOwnership, schedulesController.getSchedulesByEmployee);

router.route('/date-range')
    .get(verifyOwnership, schedulesController.getSchedulesByDateRange);

router.route('/my-schedules')
    .get(verifyOwnership, schedulesController.getMySchedules);

router.route('/:id')
    .get(verifyOwnership, schedulesController.getSchedule);

module.exports = router;