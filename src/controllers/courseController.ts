import { Request, Response } from "express";
import {
  CourseOfferingModel,
  CourseRegistrationModel,
  CourseStatus,
} from "../models/courses"; // Import the Mongoose models

// Function to add a new Course
export const addCourseOffering = async (req: Request, res: Response) => {
  const { courseTitle, instructor, date, minEmployees, maxEmployees } =
    req.body;
  try {
    const courseOffering = new CourseOfferingModel({
      id: `OFFERING_${courseTitle}_${instructor}`,
      courseTitle,
      instructor,
      date,
      minEmployees,
      maxEmployees,
      registrations: [],
    });

    await courseOffering.save();

    res.status(200).json({
      message: "course added successfully",
      data: {
        success: {
          course_id: courseOffering.id,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      message: "Internal server error",
      data: {
        failure: "Internal server error",
      },
    });
  }
};

// Function to register for a course
export const registerForCourse = async (req: Request, res: Response) => {
  const { course_id } = req.params;
  const { name, email } = req.body;

  try {
    console.log("Fetching course offering...");
    const courseOffering = await CourseOfferingModel.findOne({ id: course_id });

    if (!courseOffering) {
      console.log("Course not found");
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    console.log("Checking maximum registrations...");
    if (courseOffering.registrations.length >= courseOffering.maxEmployees) {
      console.log("Course is full");
      return res.status(400).json({
        message: "COURSE_FULL_ERROR",
        data: { FAILURE: { message: "COURSE_FULL_ERROR" } },
      });
    }

    console.log("Checking course date...");
    const currentDate = new Date();
    const courseDate = new Date(courseOffering.date);
    console.log(courseDate);
    console.log(currentDate);
    if (currentDate < courseDate) {
      console.log("Course date is in the future");
      courseOffering.status = CourseStatus.ACCEPTED;
      await courseOffering.save();
    } else if (
      currentDate >= courseDate &&
      courseOffering.registrations.length < courseOffering.minEmployees
    ) {
      console.log("Course date has paussed and minimum employees not met");
      courseOffering.status = CourseStatus.COURSE_CANCELED;
      await courseOffering.save();
      return res
        .status(400)
        .json({ success: false, message: "COURSE_CANCELED" });
    }

    console.log("Checking existing registration...");
    const existingRegistration = await CourseRegistrationModel.findOne({
      courseId: course_id,
      name: name,
      email: email,
    });

    if (existingRegistration) {
      console.log("Registration already exists");
      return res
        .status(400)
        .json({ success: false, message: "Registration already exists" });
    }

    console.log("Creating new registration...");
    const newRegistration = new CourseRegistrationModel({
      registrationId: `${name}-${course_id}`,
      courseId: course_id,
      name,
      email,
      status: CourseStatus.ACCEPTED,
    });
    console.log(courseOffering.status);
    console.log("Checking course status...");

    if (courseOffering.status === CourseStatus.ACCEPTED) {
      console.log("Course status is ACCEPTED");
      console.log("Updating course offering and saving new registration...");
      await Promise.all([
        courseOffering.updateOne({
          $push: { registrations: newRegistration.registrationId },
        }),
        newRegistration.save(),
      ]);

      return res.status(200).json({
        message: `Successfully Registered for ${course_id}`,
        data: {
          success: {
            registration_id: `${name}-${course_id}`,
            status: newRegistration.status,
          },
        },
      });
    } else {
      console.log("Course status is not ACCEPTED");
      return res
        .status(400)
        .json({ success: false, message: "COURSE_CANCELED" });
    }
  } catch (error) {
    console.error("Internal server error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Function for course allotment

export const courseAllotment = async (req: Request, res: Response) => {
  const { course_id } = req.params;

  try {
    const courseOffering = await CourseOfferingModel.findOne({ id: course_id });
    if (!courseOffering) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (courseOffering.registrations.length < courseOffering.minEmployees) {
      courseOffering.status = CourseStatus.COURSE_CANCELED;
      await courseOffering.save();
    }
    const registrations = await CourseRegistrationModel.find({
      courseId: course_id,
    }).sort({ registrationId: 1 });
    if (courseOffering.status === CourseStatus.COURSE_CANCELED) {
      res.status(200).json({
        success: true,
        message: "Course Cancelled",
        data: {
          success: registrations,
        },
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Successfullt allotted courses to the registered employees",
        data: {
          success: registrations,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Function for cancelling a course registration

export const cancelCourseRegistration = async (req: Request, res: Response) => {
  const { registration_id } = req.params;

  try {
    const registration = await CourseRegistrationModel.findOne({
      registrationId: registration_id,
    });
    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });
    }

    if (registration.status !== CourseStatus.ACCEPTED) {
      return res.status(400).json({
        message: `Cancel rejected for course ${registration.courseId} `,
        data: {
          failure: {
            message: "Cancel_Rejected",
          },
        },
      });
    }

    await CourseRegistrationModel.deleteOne({
      registrationId: registration_id,
    });

    res.status(200).json({
      message: `Successfully cancelled registration for course ${registration.courseId} `,
      data: {
        success: {
          registration_id: registration.registrationId,
          courseId: registration.courseId,
          status: "CANCEL_ACCEPTED",
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
