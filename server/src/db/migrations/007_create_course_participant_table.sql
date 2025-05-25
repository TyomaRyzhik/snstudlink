-- Create course_participant table
CREATE TABLE IF NOT EXISTS "course_participant" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "role" VARCHAR NOT NULL,
    "userId" uuid,
    "courseId" uuid,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "IDX_course_participant_userId" ON "course_participant"("userId");
CREATE INDEX IF NOT EXISTS "IDX_course_participant_courseId" ON "course_participant"("courseId"); 