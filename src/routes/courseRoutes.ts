import express from 'express';
import {
    addCourseOffering,
    registerForCourse,
    courseAllotment,
    cancelCourseRegistration
} from '../controllers/courseController';

const router = express.Router();



router.post('/add/courseOffering', addCourseOffering);
router.post('/add/register/:course_id', registerForCourse);
router.post('/allot/:course_id', courseAllotment);
router.post('/cancel/:registration_id', cancelCourseRegistration);

export default router;
