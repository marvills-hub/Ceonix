PRAGMA foreign_keys=ON;

CREATE TABLE users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Employee',
  department TEXT NOT NULL DEFAULT 'General',
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'offline',
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE channels(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(created_by) REFERENCES users(id)
);

CREATE TABLE messages(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(channel_id) REFERENCES channels(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE meals(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '???',
  meal_date TEXT NOT NULL,
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(created_by) REFERENCES users(id)
);

CREATE TABLE meal_votes(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meal_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(meal_id,user_id),
  FOREIGN KEY(meal_id) REFERENCES meals(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE polls(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  created_by INTEGER NOT NULL,
  closes_at TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(created_by) REFERENCES users(id)
);

CREATE TABLE poll_options(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  poll_id INTEGER NOT NULL,
  label TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

CREATE TABLE poll_votes(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  poll_id INTEGER NOT NULL,
  option_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(poll_id,user_id),
  FOREIGN KEY(poll_id) REFERENCES polls(id) ON DELETE CASCADE,
  FOREIGN KEY(option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE announcements(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  pinned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(author_id) REFERENCES users(id)
);

CREATE TABLE events(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(created_by) REFERENCES users(id)
);

CREATE TABLE requests(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(reviewed_by) REFERENCES users(id)
);

CREATE TABLE notifications(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_channel ON messages(channel_id,created_at);
CREATE INDEX idx_meals_date ON meals(meal_date);
CREATE INDEX idx_poll_options_poll ON poll_options(poll_id);
CREATE INDEX idx_notifications_user ON notifications(user_id,is_read);

INSERT INTO users(email,name,initials,role,department,status,is_admin) VALUES
('marben@ceosi.local','Marben Villaflor','MV','Software Developer','Development','online',1),
('angela@ceosi.local','Angela Reyes','AR','Project Manager','Management','online',0),
('joshua@ceosi.local','Joshua Santos','JS','Frontend Developer','Development','online',0),
('nicole@ceosi.local','Nicole Garcia','NG','QA Engineer','Quality Assurance','offline',0),
('carlo@ceosi.local','Carlo Mendoza','CM','UI/UX Designer','Design','online',0),
('sofia@ceosi.local','Sofia Cruz','SC','HR Specialist','Human Resources','offline',0);

INSERT INTO channels(name,description,created_by) VALUES
('general','Company-wide discussion',1),
('development','Development team',1),
('random','Anything goes',1);

INSERT INTO messages(channel_id,user_id,content) VALUES
(1,2,'Good morning team! How is everyone doing?'),
(1,3,'Morning! Everything is good here. Working on the new dashboard.'),
(1,1,'Nice. I am working on Ceonix today ??'),
(1,2,'Awesome! Looking forward to seeing it.');

INSERT INTO meals(name,emoji,meal_date,created_by) VALUES
('Chicken Inasal','??',date('now'),1),
('Pancit Canton','??',date('now'),2),
('Burger & Fries','??',date('now'),3),
('Sisig','??',date('now'),4);

INSERT INTO meal_votes(meal_id,user_id) VALUES
(1,1),(1,2),(1,3),(2,4),(2,5),(3,6);

INSERT INTO polls(question,created_by,closes_at) VALUES
('What should we do for our next team building activity?',2,datetime('now','+1 day')),
('Which snacks should we add to the office pantry?',6,datetime('now','+3 days'));

INSERT INTO poll_options(poll_id,label,position) VALUES
(1,'Beach Resort',1),(1,'Mountain Trip',2),(1,'Indoor Games',3),
(2,'Chips & Crackers',1),(2,'Fruits',2),(2,'Cookies',3);

INSERT INTO poll_votes(poll_id,option_id,user_id) VALUES
(1,1,1),(1,1,2),(1,2,3),(1,3,4),(2,6,1),(2,4,2);

INSERT INTO announcements(title,body,author_id,pinned) VALUES
('Monthly Town Hall','Our monthly company-wide town hall will be held this Friday at 3:00 PM. Everyone is encouraged to attend.',2,1),
('Welcome New Team Members!','Please welcome our newest teammates joining CEOSI this month.',6,0),
('Updated Office Guidelines','The updated office guidelines are now available. Please review the changes before Monday.',6,0);

INSERT INTO events(title,description,location,starts_at,ends_at,created_by) VALUES
('Team Building','CEOSI annual team building activity','TBA',datetime('now','+2 days'),datetime('now','+2 days','+8 hours'),2),
('Monthly Town Hall','Company-wide monthly meeting','Conference Room',datetime('now','+6 days'),datetime('now','+6 days','+1 hour'),2);

INSERT INTO requests(user_id,type,title,description,status) VALUES
(3,'leave','Vacation Leave','Personal leave request','pending'),
(4,'equipment','New Headset','Replacement headset request','pending');

INSERT INTO notifications(user_id,type,title,body,link) VALUES
(1,'announcement','New announcement','Monthly Town Hall has been posted.','/announcements'),
(1,'poll','New poll','A new team building poll is available.','/polls'),
(1,'meal','Meal voting open','Vote for today''s lunch.','/meals');
