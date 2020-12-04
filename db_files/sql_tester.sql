SELECT u.first_name
, u.last_name
, cr.trans_date
, cr.trans_location
, ccl.cat_name
, cr.amount
, mcl.mop_type
, cr.entry_desc
, tcl.wd_type 
FROM users u INNER JOIN check_register_entry cr ON u.user_name = cr.user_name
INNER JOIN cat_common_lookup ccl ON cr.category = ccl.cat_cl_id
INNER JOIN mop_common_lookup mcl ON cr.pay_method = mcl.mop_cl_id
INNER JOIN type_common_lookup tcl ON cr.wd_type = tcl.type_cl_id;