CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS course_participant;

CREATE TABLE course_participant (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR NOT NULL DEFAULT 'student', -- Or use a proper ENUM type if defined in DB
    "userId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE CASCADE
); 