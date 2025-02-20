import { Router } from 'express';
const router = Router();
import { getAllCourses, getSingleCourse } from '../controllers/course.js';

router.route('/').get(getAllCourses)
router.route('/:id').get(getSingleCourse)

export default router;
