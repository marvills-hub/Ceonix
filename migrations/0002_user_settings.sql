ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN bio TEXT;

CREATE TABLE user_settings(
  user_id INTEGER PRIMARY KEY,
  email_notifications INTEGER NOT NULL DEFAULT 1,
  chat_notifications INTEGER NOT NULL DEFAULT 1,
  meal_notifications INTEGER NOT NULL DEFAULT 1,
  poll_notifications INTEGER NOT NULL DEFAULT 1,
  compact_mode INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO user_settings(user_id) SELECT id FROM users;
