-- inserts into category cl table
INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Mortgage/Rent');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Car Payment');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Gas (Car)');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Car Maintenance');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Groceries');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Restaurants');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Electricity');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Gas (home)');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Water');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Garbage');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Phone Bill');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Cable/Internet');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Clothing');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Insurance/Healthcare');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Memberships');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Personal');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Debt');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Retirement');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Education');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Savings');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Gifts/Donations');

INSERT INTO cat_common_lookup
(cat_name)
VALUES ('Entertainment');

-- inserts into mop cl table
INSERT INTO mop_common_lookup
(mop_type)
VALUES ('Cash');

INSERT INTO mop_common_lookup
(mop_type)
VALUES ('Credit Card');

INSERT INTO mop_common_lookup
(mop_type)
VALUES ('Debit Card');

INSERT INTO mop_common_lookup
(mop_type)
VALUES ('Check');

INSERT INTO mop_common_lookup
(mop_type)
VALUES ('None');

-- inserts into type cl table
INSERT INTO type_common_lookup
(wd_type)
VALUES ('Withdrawal');

INSERT INTO type_common_lookup
(wd_type)
VALUES ('Deposit');

-- insert test data for functionality/display testing
INSERT INTO users
(user_name, first_name, last_name, monthly_income)
VALUES ('berkHath', 'Warren', 'Buffet', 1000000);

INSERT INTO balance
(user_name, balance)
VALUES ('berkHath', 1000000);

INSERT INTO check_register_entry
(user_name, trans_date, trans_location, category, amount, pay_method, entry_desc, wd_type)
VALUES ('berkHath', '11/21/2020', 'walmart', 5, 30.45, 1, 'bought weekly food', 1);

-- test query 
SELECT u.first_name
, u.last_name
, cr.trans_date
, cr.trans_location
, cr.category
, cr.amount
, cr.pay_method
, cr.entry_desc
, cr.wd_type
FROM users u INNER JOIN check_register_entry cr
ON u.user_name = cr.user_name;

