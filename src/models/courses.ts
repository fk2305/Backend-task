import { Schema, model } from 'mongoose';

export interface CourseOffering  {
    id: string;
    courseTitle: string;
    instructor: string;
    date: string;
    minEmployees: number;
    maxEmployees: number;
    registrations: string[];
    status?: CourseStatus;
}

export interface CourseRegistration {
    registrationId: string;
    courseId: string;
    name: string;
    email: string;
    status: CourseStatus;
}

export enum CourseStatus {
    ACCEPTED = 'ACCEPTED',
    COURSE_FULL_ERROR = 'COURSE_FULL_ERROR',
    COURSE_CANCELED = 'COURSE_CANCELED',
    CANCEL_ACCEPTED = 'CANCEL_ACCEPTED',
    CANCEL_REJECTED = 'CANCEL_REJECTED'
}

const courseOfferingSchema = new Schema<CourseOffering>({
    id: { type: String, required: true , unique: true},
    courseTitle: { type: String, required: true },
    instructor: { type: String, required: true },
    date: { type: String , required: true },
    minEmployees: { type: Number, required: true },
    maxEmployees: { type: Number, required: true },
    registrations: { type: [String], default: [] },
    status: { type: String, enum: ['ACCEPTED', 'COURSE_FULL_ERROR', 'COURSE_CANCELED', 'CANCEL_ACCEPTED', 'CANCEL_REJECTED'] }
});

const courseRegistrationSchema = new Schema<CourseRegistration>({
    registrationId: { type: String, required: true, unique: true },
    courseId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    status: { type: String, enum: ['ACCEPTED', 'COURSE_FULL_ERROR', 'COURSE_CANCELED', 'CANCEL_ACCEPTED', 'CANCEL_REJECTED'] }
});

courseRegistrationSchema.index({ courseId: 1, name: 1, email: 1 }, { unique: true });

export const CourseOfferingModel = model<CourseOffering>('CourseOffering', courseOfferingSchema);
export const CourseRegistrationModel = model<CourseRegistration>('CourseRegistration', courseRegistrationSchema);
