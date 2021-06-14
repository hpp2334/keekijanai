CREATE TABLE keekijanai_view (
  client_id character(64),
  scope varchar(150),
  PRIMARY KEY(client_id, scope)
);

CREATE TABLE keekijanai_star (
  user_id varchar(50) NOT NULL,
  scope varchar(150),
  star smallint,
  PRIMARY KEY(user_id, scope)
);

CREATE TABLE keekijanai_comment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scope varchar(150) NOT NULL,
  user_id varchar(50) NOT NULL,
  content text NOT NULL,
  plain_text text NOT NULL,
  c_time bigint NOT NULL,
  reference_id bigint,
  parent_id bigint,
  child_counts int DEFAULT 0
);

CREATE TABLE keekijanai_user (
  id varchar(50) PRIMARY KEY,
  name varchar(50),
  role int DEFAULT 1,
  password varchar(64),
  provider varchar(50),
  last_login bigint,
  avatar_url varchar(200),
  email varchar(50)
);

CREATE TABLE keekijanai_user_role (
  id varchar(50),
  scope VARCHAR(50),
  role int,
  PRIMARY KEY(id, scope)
)