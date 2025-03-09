import { Course } from '../models/Course.js';
import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors/index.js';

// Get All courses
const getAllCourses = async (req, res) => {
  const courses = await Course.find()
    .populate('category')
    .populate('subCategories');
  res.status(StatusCodes.OK).json(courses);
}

// Get single course
const getSingleCourse = async (req, res) => {
  const {
    params: { id: courseId },
  } = req;
  
  const course = await Course.findOne({
    _id: courseId,
  });

  if (!course) {
    throw new NotFoundError(`No post with id ${courseId}`);
  }

  res.status(StatusCodes.OK).json(course)
}

const getUserCourse = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Authentication required"
      });
    }
    
    const user = await User.findById(userId)
      .populate({
        path: 'enrolledCourses.course',
        select: 'title description category videoUrl price tutor'
      });
    console.log('User', user)
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found"
      });
    }
    
    const completedEnrollments = user.enrolledCourses.filter(
      enrollment => enrollment.paymentStatus === 'completed'
    );
    
    res.status(StatusCodes.OK).json({
      success: true,
      enrolledCourses: completedEnrollments
    });
  } 
  catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error fetching enrolled courses",
        error: error.message
    });
  }
};

export {
  getAllCourses,
  getSingleCourse,
  getUserCourse
};
