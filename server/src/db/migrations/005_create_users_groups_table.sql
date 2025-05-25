-- Create the junction table for the many-to-many relationship between users and groups
CREATE TABLE users_groups_group (
    "usersId" UUID NOT NULL,
    "groupId" INTEGER NOT NULL,
    PRIMARY KEY ("usersId", "groupId"),
    FOREIGN KEY ("usersId") REFERENCES "users"(id) ON DELETE CASCADE,
    FOREIGN KEY ("groupId") REFERENCES "group"(id) ON DELETE CASCADE
); 