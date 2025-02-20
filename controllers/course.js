import { Course } from '../models/Course.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors/index.js';

// Get All courses
const getAllCourses = async (res, req) => {
  const courses = await Course.find()
    .populate('category')
    .populate('subCategories');
  res.status(StatusCodes.OK).json(courses);
}

// Get single course
const getSingleCourse = async (res, req) => {
  const {
    params: { id: courseId },
  } = req;
  
  const course = await findOne({
    _id: courseId,
  });

  if (!course) {
    throw new NotFoundError(`No post with id ${courseId}`);
  }

  res.status(StatusCodes.OK).json(course)
}


export {
  getAllCourses,
  getSingleCourse
};
