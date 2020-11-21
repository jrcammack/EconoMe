-- create user table
CREATE TABLE users (
   user_name VARCHAR(50) CONSTRAINT pk_user PRIMARY KEY,
   first_name VARCHAR(70) CONSTRAINT nn_user_1 NOT NULL,
   last_name VARCHAR(70) CONSTRAINT nn_user_2 NOT NULL,
   monthly_income NUMERIC CONSTRAINT nn_user_3 NOT NULL
);

-- create common lookup tables
CREATE TABLE cat_common_lookup (
   cat_cl_id SERIAL CONSTRAINT pk_cat_common_lookup PRIMARY KEY,
   cat_name VARCHAR(50) CONSTRAINT nn_cat_common_lookup_1 NOT NULL
);

CREATE TABLE mop_common_lookup (
   mop_cl_id SERIAL CONSTRAINT pk_mop_common_lookup PRIMARY KEY,
   mop_type VARCHAR(50) CONSTRAINT nn_mop_common_lookup_1 NOT NULL
);

CREATE TABLE type_common_lookup (
   type_cl_id SERIAL CONSTRAINT pk_type_common_lookup PRIMARY KEY,
   wd_type VARCHAR(50) CONSTRAINT nn_type_common_lookup_1 NOT NULL
);

-- create balance table
CREATE TABLE balance (
   balance_id SERIAL CONSTRAINT pk_balance PRIMARY KEY,
   user_name VARCHAR(50) CONSTRAINT nn_balance_1 NOT NULL,
   balance NUMERIC CONSTRAINT nn_balance_2 NOT NULL,
   CONSTRAINT fk_balance_1 FOREIGN KEY(user_name) REFERENCES users(user_name)
);

-- create goals table
CREATE TABLE goals (
   goal_id SERIAL CONSTRAINT pk_goals PRIMARY KEY,
   user_name VARCHAR(50) CONSTRAINT nn_goals_1 NOT NULL,
   category int CONSTRAINT nn_goals_2 NOT NULL,
   goal_title VARCHAR(50) CONSTRAINT nn_goals_3 NOT NULL,
   goal_desc VARCHAR(400),
   CONSTRAINT fk_goals_1 FOREIGN KEY(user_name) REFERENCES users(user_name),
   CONSTRAINT fk_goals_2 FOREIGN KEY(category) REFERENCES cat_common_lookup(cat_cl_id)
);

-- create check register entry table
CREATE TABLE check_register_entry (
   entry_id SERIAL CONSTRAINT pk_check_register_entry PRIMARY KEY,
   user_name VARCHAR(50) CONSTRAINT nn_check_register_entry_1 NOT NULL,
   trans_date DATE CONSTRAINT nn_check_register_entry_2 NOT NULL,
   trans_location VARCHAR(100) CONSTRAINT nn_check_register_entry_3 NOT NULL,
   category int CONSTRAINT nn_check_register_entry_4 NOT NULL,
   amount NUMERIC CONSTRAINT nn_check_register_entry_5 NOT NULL,
   pay_method int CONSTRAINT nn_check_register_entry_6 NOT NULL,
   entry_desc VARCHAR(300) CONSTRAINT nn_check_register_entry_7 NOT NULL,
   wd_type int CONSTRAINT nn_check_register_entry_8 NOT NULL,
   CONSTRAINT fk_check_register_entry_1 FOREIGN KEY(user_name) REFERENCES users(user_name),
   CONSTRAINT fk_check_register_entry_2 FOREIGN KEY(category) REFERENCES cat_common_lookup(cat_cl_id),
   CONSTRAINT fk_check_register_entry_3 FOREIGN KEY(pay_method) REFERENCES mop_common_lookup(mop_cl_id),
   CONSTRAINT fk_check_register_entry_4 FOREIGN KEY(wd_type) REFERENCES type_common_lookup(type_cl_id)
);