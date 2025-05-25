-- Add foreign key to course_participant table referencing courses
ALTER TABLE "course_participant"
ADD CONSTRAINT "FK_course_participant_courseId"
FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE; 