# Libra — Library Management System

A responsive, browser-based Library Management System built with HTML, CSS and vanilla JavaScript. It is ready to deploy to Vercel as a static site.

## Features
- Dashboard with collection, issue, member and overdue summaries
- Add, edit, search and delete book records
- Register and manage Student and Faculty members
- Issue books and record returns
- Borrowing limits: Student 3 books, Faculty 5 books
- Loan periods can be set when issuing (the form defaults to 14 days for students and 30 days for faculty)
- Automatic late fine calculation: Student ₹5/day, Faculty ₹2/day
- Reports with category/member breakdown and CSV inventory export
- Saves data in the browser using localStorage
- Responsive layout for desktop and mobile

## Run locally
Open `index.html` in a browser. No build step or package installation is required.

## Deploy to Vercel
1. Extract this ZIP.
2. Sign in to Vercel and choose **Add New → Project**.
3. Import a GitHub repository containing these files, or use Vercel's supported deployment flow.
4. For a static site, leave the framework preset as **Other**.
5. Set the output directory to `.` (the project root), with no build command.
6. Deploy.

You can also push this folder to GitHub and import that repository into Vercel.

## Important note
This is a front-end micro-project/demo. Records are stored in the current browser's localStorage, so they are not shared between devices or users. Clearing browser storage removes the saved data. For a real multi-user library, connect a database and authentication service (for example, Supabase or Firebase).
