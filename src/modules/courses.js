const loginToAmizone = require("../utils/login");
const { JSDOM } = require('jsdom');

const extractCoursesData = (document) => {
  const courses = [];
  
  // Extract course details using querySelectorAll from the correct table
  const rows = document.querySelectorAll("#CourseListSemWise table tbody tr");

  rows.forEach((row) => {
    const course = {
      code: row.querySelector('td[data-title="Course Code"]')?.textContent.trim(),
      name: row.querySelector('td[data-title="Course Name"]')?.textContent.trim(),
      type: row.querySelector('td[data-title="Type"]')?.textContent.trim(),
      syllabus: row.querySelector('td[data-title="Course Syllabus"] a') ? 'Link Available' : 'No Link',
      sessionPlans: row.querySelector('td[data-title="Session Plans"] button') ? 'View Available' : 'No View',
      attendance: row.querySelector('td[data-title="Attendance"] button')?.textContent.trim()
    };
    courses.push(course);
  });

  return courses;
};


const fetchCoursesData = async (credentials) => {
  let browser, page;
  try {
    const result = await loginToAmizone(credentials);
    if (result.error) return { error: result.error };

    browser = result.browser;
    page = result.page;

    console.log("Waiting for 'My Courses' tab...");
    await page.waitForSelector('[id="M18"]', { timeout: 120000 }); // Adjust timeout
    await page.evaluate(() => document.querySelector('[id="M18"]').click());

    console.log("Monitoring network requests...");
    page.on('response', (response) => {
      console.log('Response URL:', response.url());
      console.log('Status:', response.status());
      if (response.status() === 302) {
        console.log("Redirecting to:", response.headers()['location']);
      }
    });

    console.log("Waiting for 'FlaxiCourses' response...");
    const response = await page.waitForResponse(
      (response) =>
        response.url().includes("/Academics/FlaxiCourses") && response.status() === 200,
      { timeout: 120000 }
    );

    const responseHTML = await response.text();
    console.log(responseHTML);

    const courses = extractCoursesData(new JSDOM(responseHTML).window.document);
    console.log("Extracted courses:", courses);

    return courses;
  } catch (err) {
    console.error("Error in fetchCoursesData:", err);
    return { error: `Request Timeout or Element Not Found: ${err.message}` };
  } finally {
    if (browser) await browser.close();
  }
};





module.exports = fetchCoursesData;
