import { Router } from 'express';
const router = Router();
import authenticateUser from '../middleware/authentication.js';
import { getAllCourses, getSingleCourse, getUserCourse } from '../controllers/course.js';

router.route('/').get(getAllCourses);
router.route('/enrolled').get(authenticateUser, getUserCourse);
router.route('/:id').get(getSingleCourse);


export default router;
