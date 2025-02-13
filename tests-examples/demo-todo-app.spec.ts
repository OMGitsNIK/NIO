import { test, expect, type Page } from '@playwright/test';



// 1. Responsiveness
test('Responsive design validation', async ({ page }) => {
    const viewports = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 768, height: 1024 },  // Tablet
        { width: 375, height: 812 },  // Mobile
    ];

    for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('http://localhost:3001/');
        expect(await page.isVisible('header')).toBeTruthy(); // Check header visibility
        expect(await page.isVisible('footer')).toBeTruthy(); // Check footer visibility
    }
});

// 2. Login verification
test('Login verification', async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3001//dashboard');
    expect(await page.isVisible('text=Welcome testuser')).toBeTruthy();
});

// 3. Signup
test('Signup flow', async ({ page }) => {
    await page.goto('http://localhost:3001/signup');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'securePassword123');
    await page.click('button[type="submit"]');
    expect(await page.isVisible('text=Account created successfully')).toBeTruthy();
});

// 4. Sessions
test('Session persistence', async ({ page, browser }) => {
    await page.goto('http://localhost:3001/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.context().storageState({ path: 'session.json' });
    expect(await page.isVisible('text=Welcome testuser')).toBeTruthy();

    const newContext = await browser.newContext({ storageState: 'session.json' });
    const newPage = await newContext.newPage();
    await newPage.goto('http://localhost:3001/dashboard');
    expect(await newPage.isVisible('text=Welcome testuser')).toBeTruthy();
});

// 5. Irrelevant images test
test('Detect irrelevant images', async ({ page }) => {
    await page.goto('http://localhost:3001/upload');
    await page.setInputFiles('input[type="file"]', 'path/to/irrelevant-image.jpg');
    await page.click('button[type="submit"]');
    expect(await page.isVisible('text=Irrelevant image detected')).toBeTruthy();
});

// 6. Dehazing images
test('Dehazing image functionality', async ({ page }) => {
    await page.goto('http://localhost:3001/dehaze');
    await page.setInputFiles('input[type="file"]', 'path/to/hazy-image.jpg');
    await page.click('button[type="submit"]');
    expect(await page.isVisible('img[data-testid="dehazed-image"]')).toBeTruthy();
});

// 7. Flow for uploading datasets
test('Upload dataset', async ({ page }) => {
    await page.goto('http://localhost:3001/datasets');
    await page.click('button#upload-dataset');
    await page.setInputFiles('input[type="file"]', 'path/to/dataset.zip');
    await page.click('button#submit-dataset');
    expect(await page.isVisible('text=Dataset uploaded successfully')).toBeTruthy();
});

// 8. Performance and accuracy
test('Measure performance and accuracy', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    const startTime = Date.now();
    await page.click('button#run-analysis');
    await page.waitForSelector('text=Analysis complete');
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log("Analysis completed in ${duration}ms");
    expect(duration).toBeLessThan(5000); // Ensure performance under 5s
    expect(await page.isVisible('text=Accuracy: 95%')).toBeTruthy();
});

// 9. Report generation
test('Generate and download report', async ({ page }) => {
    await page.goto('http://localhost:3001/reports');
    await page.click('button#generate-report');
    await page.waitForSelector('text=Report generated successfully');
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('button#download-report'),
    ]);
    expect(download.suggestedFilename()).toContain('report');
});

// 10. Dashboard - "Your datasets"
test('Dashboard displays datasets', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard');
    expect(await page.isVisible('text=Your Datasets')).toBeTruthy();
    expect(await page.isVisible('table#datasets-list')).toBeTruthy();
});

// 11. Show image description
test('View image description', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard');
    await page.click('button#show-description');
    expect(await page.isVisible('text=Image Description:')).toBeTruthy();
});

// 12. Metadata of images
test('Display image metadata', async ({ page }) => {
    await page.goto('http://localhost:3001/image/metadata');
    expect(await page.isVisible('text=Metadata')).toBeTruthy();
});

// 13. Add/invite people to collaborate
test('Invite collaborators', async ({ page }) => {
    await page.goto('http://localhost:3001/collaborate');
    await page.fill('input[name="email"]', 'collaborator@example.com');
    await page.click('button#invite');
    expect(await page.isVisible('text=Invitation sent')).toBeTruthy();
});

// 14. Download images
test('Download image', async ({ page }) => {
    await page.goto('http://localhost:3001/images');
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('button#download-image'),
    ]);
    expect(download.suggestedFilename()).toContain('.jpg');
});

// 15. Rename, copy images
test('Rename and copy images', async ({ page }) => {
    await page.goto('http://localhost:3001/images');
    await page.click('button#rename');
    await page.fill('input[name="new-name"]', 'new-image-name.jpg');
    await page.click('button#save');
    expect(await page.isVisible('text=Image renamed successfully')).toBeTruthy();

    await page.click('button#copy');
    expect(await page.isVisible('text=Image copied successfully')).toBeTruthy();
});

// 16. Move images to other datasets
test('Move images between datasets', async ({ page }) => {
    await page.goto('http://localhost:3001/datasets');
    await page.dragAndDrop('img#image1', 'div#target-dataset');
    expect(await page.isVisible('text=Image moved successfully')).toBeTruthy();
});

// 17. Validate tooltips on hover
test('Validate tooltips on hover', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    await page.hover('button#info-icon');
    expect(await page.isVisible('text=This is a tooltip')).toBeTruthy();
});

// 18. Check for broken links
test('Check for broken links', async ({ page }) => {
  await page.goto('http://localhost:3001/');
  const links = await page.$$eval('a', links => links.map(link => link.href));

  for (const link of links) {
      const response = await page.goto(link);
      
      // Ensure the response is not null before accessing its status
      if (response) {
          expect(response.status()).toBeLessThan(400);
      } else {
          // Optionally handle cases where response is null (e.g., log an error)
          console.error(`Failed to load: ${link}`);
      }
  }
});

// 19. Validate pagination
test('Validate pagination on datasets', async ({ page }) => {
    await page.goto('http://localhost:3001/datasets');
    await page.click('button#next-page');
    expect(await page.isVisible('text=page 2')).toBeTruthy();

    await page.click('button#previous-page');
    expect(await page.isVisible('text=page 1')).toBeTruthy();
});

// 20. Validate search functionality
test('Search datasets', async ({ page }) => {
    await page.goto('http://localhost:3001/datasets');
    await page.fill('input#search-bar', 'Dataset 1');
    await page.click('button#search');
    expect(await page.isVisible('text=Dataset 1')).toBeTruthy();
});
