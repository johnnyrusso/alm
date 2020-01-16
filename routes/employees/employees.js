/**
 * TODO: Employee Confirm Timesheet Submission
 * TODO: Admin Timesheet View
 */
const ejsLint = require("ejs-lint");
ejsLint.lint('/login.ejs')
const express = require('express'),
    passport = require('passport'),
    bcrypt = require('bcryptjs'),
    moment = require('moment'),
    funcs = require('../../config/functions').exists,
    dateTime = require('../../config/dateFuncs'),
    {
        pool,
        promQuery,
        selectAll
    } = require('../../config/db');
	(router = express.Router()),
	({
	    ensureAuthenticated,
	    forwardAuthenticated,
	    ensureLevel
	} = require('../../config/auth'));

// Login Page
router.get('/register', forwardAuthenticated, (req, res) => {
    res.locals.title = 'ALM - Staff Login';
    const cssFiles  = ['staff'];
    res.render('./employees/register', {
        cssFiles: 'staff'
    })
});

// Register Page
router.get('/login', forwardAuthenticated, (req, res) => {
    res.locals.title = 'ALM - Staff Registration';
    res.render('./employees/login', {
        cssFiles: ['login']
    })
});

// POST Request: Employee Registration
router.post('/register', (req, res) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        dob,
        address,
        city,
        zip,
        password2
    } = req.body;
    let {
        password
    } = req.body;
    let errors = [];

    //Check required fields
    if (!firstName ||
        !lastName ||
        !email ||
        !password ||
        !phone ||
        !dob ||
        !address ||
        !city ||
        !zip
    ) {
        errors.push({
            msg: 'Please fill in all fields'
        })
    }
    if (password !== password2) {
        errors.push({
            msg: 'Passwords do not match'
        })
    }
    // Check Password Length
    if (password.length < 8) {
        errors.push({
            msg: 'Password must be at least 8 characters'
        })
    }
    // Pass In Errors
    if (errors.length > 0) {
        res.render('./employees/register', {
            errors,
            firstName,
            email,
            password,
            password2,
            phone,
            dob,
            address,
            city,
            zip
        })
    } else {
        // Bcrypt Password

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) throw err;
                password = hash;
                let sql =
                    "INSERT INTO `employees`(`first_name`, `last_name`, `email`, `dob`, `phone_number`, `address`, `city`, `zip`, `pwd`) VALUES ('" +
                    firstName +
                    "','" +
                    lastName +
                    "','" +
                    email +
                    "','" +
                    dob +
                    "','" +
                    phone +
                    "','" +
                    address +
                    "','" +
                    city +
                    "','" +
                    zip +
                    "','" +
                    password +
                    "')";
                pool.query(sql, (err, result) => {
                    if (err) {
                        throw err;
                        res.render('./employees/login', {
                            title: 'ALM - Employee Login',
                            cssFiles: []
                        })
                    }
                })
            })
        })
    }
});
// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: './dashboard',
        failureRedirect: './login',
        failureFlash: true
    })(req, res, next)
});


// Dashboard
router.get(['/', '/dashboard'], ensureAuthenticated, (req, res) => {
    const dashboardInfoSql =
    `SELECT week_ending\
    FROM timesheets\
    WHERE employee_id = ?\
    ORDER BY week_ending DESC\
    LIMIT 1;`;

    pool.promise().query(dashboardInfoSql, [req.user.id])
    .then(([rows,fields]) => {
        return rows;
    })
    .catch(console.log)
    .then(rows => {
    res.render('./employees/dashboard', {
        title: 'ALM - Employee Dashboard',
        cssFiles: [],
        getDay: dateTime.getDayOfWeek,
        getHoursMinutes: dateTime.minutesToHoursMinutes,
        moment: moment,
        row: rows,
        getWeekEnding: dateTime.nextWeekday,
        firstName: req.user.first_name
       })
    });
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are now logged out');
    res.redirect('./login')
});

// Timesheet Routes
router.get('/timesheets/new', ensureAuthenticated, (req, res) => {
	let cssFiles = ['date-picker'];
    res.render('./employees/timesheets/new', {
        title: 'ALM - Employee Timesheet',
        cssFiles: cssFiles,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        email: req.user.email,
        moment: moment,
        getDay: dateTime.getDayOfWeek

    })
});

/*=============================================
=            Timesheets           			 =
=============================================*/

/*----------  POST New Timesheet  ----------*/

router.post('/timesheets', ensureAuthenticated, (req, res) => {
    const {
        timesheet
    } = req.body;
    console.log(timesheet);
    // Convert Submitted dateWorked to ISO Date Format
    const isoDateWorked = moment(timesheet.dateWorked).format('YYYY-MM-DD');
    const weekEnding = new Date(
        dateTime
        .nextWeekday(moment(timesheet.dateWorked), 7)
    );
    // Find Out If Locations Table Contains Data For This Employee, This Location, And This Date
    // If Data Does Not Exist, Do Not Add New Location Data
    // Instead, Add Tasks
    const selectLocationSql =
        'SELECT * FROM `locations` WHERE `employee_id` = ? AND `location` = ? AND `date_worked` = ? LIMIT 1';
    const selectTimesheetSql =
        'SELECT * FROM `timesheets` WHERE `employee_id` = ? AND `week_ending` = ?';
    const insertTasksSql =
        'INSERT INTO `tasks` (`employee_id`, `task_type`, `task_minutes`, `date_worked`, `location_id`, `timesheet_id`) VALUES ?';
    let timesheetId;
    // Run SELECT Query For Timesheets
    pool.query(
        selectTimesheetSql, [req.user.id, weekEnding],
        (err, timesheetRow) => {
            if (err) throw err;
            console.log(timesheetRow);
            let minutesWorkedArr = [];
            // Convert All Tasks Times To Total Minutes and Push To minutesWorkedArr
            for (let v of Object.values(timesheet.tasks)) {
                minutesWorkedArr.push(
                    dateTime.hoursToMinutes(Number(v.minutes), Number(v.hours))
                )
            }
            let totalMinutesWorked = minutesWorkedArr.reduce((last, curr) => {
                return last + curr
            });
            // If No Timesheet In Database For Current Employee And Week Ending, Add One
            if (!timesheetRow.length) {
                timesheetFields = {
                    employee_id: req.user.id,
                    week_ending: weekEnding,
                    total_minutes_worked: totalMinutesWorked
                };
                const insertTimesheetSql = 'INSERT INTO `timesheets` SET ?';
                pool.query(
                    insertTimesheetSql,
                    timesheetFields,
                    (err, insertTimesheetRow) => {
                        if (err) throw err;
                        // Timesheet ID
                        timesheetId = insertTimesheetRow.insertId;
                        console.log('insert', timesheetId);

                        const insertLocationSql = "INSERT INTO `locations` SET ?";
                        locationFields = {
                            employee_id: req.user.id,
                            timesheet_id: timesheetId,
                            date_worked: isoDateWorked,
                            week_ending: weekEnding,
                            location: timesheet.location
                        };
                        pool.query(insertLocationSql, locationFields, (err, insertLocationRow) => {
                            if (err) throw err;
                            let locationId = insertLocationRow.insertId;
                            // Create tasksArray And Loop Through HTML Form Data, Pushing Data To tasksArr
                            let tasksArr = [];
                            let i = 0;
                            for (let v of Object.values(timesheet.tasks)) {
                                // Push Task Type To tasksArr
                                tasksArr.push([v.taskName]);
                                // Convert Total Hours/Minutes Worked To Total Minutes Worked, Then Push
                                tasksArr[i].push(
                                    dateTime.hoursToMinutes(
                                        Number(v.minutes),
                                        Number(v.hours)
                                    )
                                );
                                // Push Employee ID
                                tasksArr[i].splice(0, 0, req.user.id);
                                // Push Date Worked
                                tasksArr[i].push(isoDateWorked);
                                tasksArr[i].push(locationId);
                                tasksArr[i].push(timesheetId);
                                i += 1
                            }
                            pool.query(insertTasksSql, [tasksArr], (err, insertTasksRow) => {
                                if (err) throw err;
                                console.log(insertTasksRow);
                                res.send('good')
                            })
                        })
                    }
                )
            } else {
                if (err) throw err;
                timesheetId = timesheetRow[0].timesheet_id;
                let totalMinutes = (timesheetRow[0].total_minutes_worked += totalMinutesWorked);
                const updateTimesheetSql =
                    'UPDATE `timesheets` SET `total_minutes_worked` = ? WHERE `employee_id` = ? AND `week_ending` = ?';
                pool.query(
                    updateTimesheetSql, [totalMinutes, req.user.id, weekEnding],
                    (err, updatedTimesheetRow) => {
                        if (err) throw err;
                        // Run SELECT Query For Locations
                        pool.query(
                            selectLocationSql, [req.user.id, timesheet.location, isoDateWorked],
                            (err, row) => {
                                if (err) throw err;
                                // Create tasksArray And Loop Through HTML Form Data, Pushing Data To tasksArr
                                let tasksArr = [];
                                let i = 0;
                                for (let v of Object.values(timesheet.tasks)) {
                                    // Push Task Type To tasksArr
                                    tasksArr.push([v.taskName]);
                                    // Convert Total Hours/Minutes Worked To Total Minutes Worked, Then Push
                                    tasksArr[i].push(
                                        dateTime.hoursToMinutes(
                                            Number(v.minutes),
                                            Number(v.hours)
                                        )
                                    );
                                    // Push Employee ID
                                    tasksArr[i].splice(0, 0, req.user.id);
                                    // Push Date Worked
                                    tasksArr[i].push(isoDateWorked);
                                    if (row.length > 0) {
                                        tasksArr[i].push(row[0].location_id);
                                        tasksArr[i].push(timesheetId)
                                    }
                                    i += 1
                                }

                                // If Current Employee Has Not Submitted Timesheet For This Location On This Date:
                                if (!row.length) {
                                    locationFields = {
                                        employee_id: req.user.id,
                                        timesheet_id: timesheetId,
                                        date_worked: isoDateWorked,
                                        week_ending: weekEnding,
                                        location: timesheet.location
                                    };
                                    pool.query(
                                        'INSERT INTO `locations` SET ?',
                                        locationFields,
                                        (err, rows) => {
                                            if (err) throw err;
                                            // Set Empty Array For Tasks And Task Hours, Then Loop Through Timesheet Object, Pushing Values
                                            for (let i = 0; i < tasksArr.length; i++) {
                                                // Push Newly Create Location location_id To tasksArr
                                                tasksArr[i].push(rows.insertId);
                                                tasksArr[i].push(timesheetId)

                                            }
                                            pool.query(insertTasksSql, [tasksArr], (err, rows) => {
                                                if (err) throw err;
                                                res.send('great')
                                            })
                                        }
                                    )
                                } else {
                                    pool.query(insertTasksSql, [tasksArr], (err, rows) => {
                                        if (err) throw err;
                                        res.send('test')
                                    })
                                }
                            }
                        )
                    }
                )
            }
        })
});

// This Weeks Timesheet
router.get('/timesheets/view/current', (req, res) => {
    const timesheetJoinSql = `
    SELECT TS.total_minutes_worked, TS.week_ending, L.location, L.date_worked, T.task_type, T.task_minutes
    FROM timesheets AS TS
    INNER JOIN locations AS L ON TS.timesheet_id = L.timesheet_id
    INNER JOIN tasks AS T ON L.date_worked = T.date_worked AND TS.week_ending = L.week_ending
    WHERE TS.employee_id = ?
    AND TS.week_ending = ?;`;
    pool.promise().query(timesheetJoinSql, [req.user.id, req.query.week_ending])
    .then(([rows,fields]) => {
        return rows;
    })
    .catch(console.log)
    .then(rows => {
        let daysWorked = [];
        rows.filter( (days) => {
            if (!daysWorked.includes(moment(days.date_worked).format('dddd'))) {
                daysWorked.push(moment(days.date_worked).format('dddd'))
            }
            
        });
        let locationsWorked = [...new Set(rows.map(locations => locations.location))]

        console.log(rows)
        return(res.send({
            rows,
            daysWorked,
            locationsWorked
           }))
    });
});
//todo ajax

/*=============================================
=           Admin Routes		              =
=============================================*/

// todo:
/*----------  Admin Dashboard  ----------*/
router.get('/admin', ensureAuthenticated, ensureLevel('admin'), (req, res) => {
    const adminDashSql = 'SELECT id FROM employees';
    pool.promise().query(adminDashSql)
        .then(([rows, fields]) => {
            return rows.length;
        })
        .catch(console.log)
        .then(employeeCount => {
            res.render('./employees/admin', {
                title: 'ALM - Admin Section',
                cssFiles: cssFiles,
                firstName: req.user.first_name,
                lastName: req.user.last_name,
                moment: moment,
                employeeCount: employeeCount,
                lvl: req.user.access_level
            })
        });
        let cssFiles = ['admin-buttons'];

});
/*----------  SHOW All Employees  ----------*/
router.get(
    '/admin/viewStaff',
    ensureAuthenticated,
    ensureLevel('admin'),
    (req, res) => {
        var sql = 'SELECT * COUNT(*) AS namesCount FROM names WHERE age = ?';
        let cssFiles = [
            'https://cdn.datatables.net/responsive/2.2.3/css/responsive.bootstrap4.min',
            'modal'
        ];
        pool.query(
            'SELECT * FROM `employees`; SELECT * FROM `timesheets` ORDER BY week_ending DESC',
            (error, rows) => {
                if (error) {
                    throw error
                } else {
                    res.render('./employees/admin/viewStaff', {
                        title: 'ALM - Admin Console',
                        cssFiles: cssFiles,
                        staff: rows,
                        moment: moment
                    })
                }
            }
        )
    }
);


/*----------  SHOW One Employee  ----------*/
router.get(
    '/admin/viewEmployee/:staff_id',
    ensureAuthenticated,
    ensureLevel('admin'),
    (req, res) => {
        pool.query(
            'SELECT * FROM `employees` WHERE `id` = ? LIMIT 1', [req.params.staff_id],
            function (err, row) {
                if (err) {
                    throw err
                }
                pool.query(
                    'SELECT DISTINCT `week_ending` FROM `locations` WHERE `employee_id`= ? ORDER BY `week_ending` DESC', [req.params.staff_id],
                    function (err, results) {
                        if (err) throw err;
                        res.render('./employees/admin/viewEmployee', {
                            title: 'ALM - Staff Info View',
                            cssFiles: ['modal-edit'],
                            ts: results,
                            employee: row[0]
                        });

                        console.log(results)
                    }
                )
            }
        )
    }
);
/**----------------------------------/
 * @description SHOW Specific Staff Timesheet #Admin
 * todo: finish view
 /----------------------------------*/


router.get('/admin/timesheets/view/:staff_id/:week_ending', ensureAuthenticated, (req, res) => {
    let timesheetData = [
        req.params.staff_id,
        req.params.week_ending
    ];
    // Select One Timesheet
    const timesheetJoinSql = `
         SELECT TS.total_minutes_worked, TS.week_ending, L.location, L.date_worked, T.task_type, T.task_minutes
         FROM timesheets AS TS
         INNER JOIN locations AS L ON TS.timesheet_id = L.timesheet_id
         INNER JOIN tasks AS T ON L.date_worked = T.date_worked AND TS.week_ending = L.week_ending
         WHERE TS.employee_id = ?
         AND TS.week_ending = ?
         ORDER BY L.location;`;
    pool.query(timesheetJoinSql, timesheetData, (err, timesheetRows) => {
        if (err) throw err;
        console.log(timesheetRows);
        let daysWorked = [];
        timesheetRows.filter( (days) => {
            if (!daysWorked.includes(moment(days.date_worked).format('dddd'))) {
                daysWorked.push(moment(days.date_worked).format('dddd'))
            }
        });
        let locations = timesheetRows.map(location => location.location);

        dateTime.sortDays(daysWorked);
        const selectEmployeeSql = 'SELECT first_name, last_name FROM employees WHERE id = ? LIMIT 1';
        pool.query(selectEmployeeSql, [req.params.staff_id], (err, employeeRow) => {
            if (err) throw err;
            res.render('./employees/admin/viewTimesheet', {
                title: 'ALM - Viewing Staff Timesheet',
                cssFiles: ['https://cdn.datatables.net/responsive/2.2.3/css/responsive.bootstrap4.min'],
                moment: moment,
                locations: locations,
                getDay: dateTime.getDayOfWeek,
                getHoursMinutes: dateTime.minutesToHoursMinutes,
                exists: funcs,
                timesheet: timesheetRows,
                daysWorked: daysWorked,
                jquery: require('jquery'),
                employee: employeeRow[0]
            })
        })
    })
});
module.exports = router;