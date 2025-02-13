import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000'; // Change as per your setup

test.describe('User Authentication', () => {
  // test('User can sign up', async ({ page }) => {
  //   await page.goto(`${BASE_URL}/signup`);
  //   await page.fill('#username', 'nikrao');
  //   await page.fill('#email', 'nikrao@gmail.com');
  //   await page.fill('#password', '123456');
  //   await page.click('#signup-btn');
  //   await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  // });

  test('User can log in', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#email', 'nikrao@gmail.com');
    await page.fill('#password', '123456');
    await page.click('#login-btn');
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });
});

test.describe('Responsive Design', () => {
  test('App is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL);
    await expect(page.locator('#mobile-menu')).toBeVisible();
  });
});

test.describe('Image Dataset Handling', () => {
  test('User can upload a dataset of images', async ({ page }) => {
    await page.goto(`${BASE_URL}/upload`);
    await page.setInputFiles('#dataset-upload', ['test-data/coral1.jpg', 'test-data/coral2.jpg']);
    await page.click('#upload-btn');
    await expect(page.locator('.upload-success')).toBeVisible();
  });

  test('User can view uploaded images', async ({ page }) => {
    await page.goto(`${BASE_URL}/gallery`);
    await expect(page.locator('.image-thumbnail')).toHaveCount(2);
  });
});

test.describe('Image Analysis', () => {
  test('User can perform analysis on images', async ({ page }) => {
    await page.goto(`${BASE_URL}/analysis`);
    await page.click('#analyze-btn');
    await expect(page.locator('.analysis-result')).toBeVisible();
  });
});
