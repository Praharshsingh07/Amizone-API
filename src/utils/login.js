const puppeteer = require("puppeteer-extra");
const blockResourcesPlugin = require('puppeteer-extra-plugin-block-resources')();

puppeteer.use(blockResourcesPlugin);

// Block unnecessary resources to speed up the process
blockResourcesPlugin.blockedTypes.add('image');
blockResourcesPlugin.blockedTypes.add('stylesheet');
blockResourcesPlugin.blockedTypes.add('font');
blockResourcesPlugin.blockedTypes.add('media');

const loginToAmizone = async (credentials) => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--window-size=1280,800',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(60000);

  try {
    console.log("Navigating to Amizone login page...");
    await page.goto("https://student.amizone.net/");

    // Extract hidden fields
    const hiddenInputs = await page.$$eval('form#loginform input[type="hidden"]', inputs =>
      Object.fromEntries(inputs.map(input => [input.name, input.value]))
    );

    // Fill login details
    await page.type('input[name="_UserName"]', credentials.username);
    await page.type('input[name="_Password"]', credentials.password);

    // Inject hidden inputs
    await page.evaluate((inputs) => {
      Object.keys(inputs).forEach(name => {
        document.querySelector(`input[name="${name}"]`).value = inputs[name];
      });
    }, hiddenInputs);

    // Submit the form
    console.log("Submitting login form...");
    await page.click('button[type="submit"]');

    // Wait for navigation or selector
    //await page.waitForSelector('div#home', { timeout: 90000 });
    console.log("Login successful!");
    // const html = await page.content();
    // console.log(html); // Logs the full page HTML
    const currentURL = await page.url();
    console.log(`Current URL: ${currentURL}`);



    return { page, browser };
  } catch (error) {
    console.error("Error during login:", error);
    await browser.close();
    return { error: "Login failed. Check credentials or website structure." };
  }
};



module.exports = loginToAmizone;
