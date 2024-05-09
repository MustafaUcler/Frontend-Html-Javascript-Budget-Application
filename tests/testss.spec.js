const { test, expect } = require('@playwright/test');

test('Page loads successfully', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/'); 
  await page.waitForSelector('header');
  const title = await page.title();
  expect(title).toBe('Budget Application');
});

test('Adding a transaction updates total balance', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/'); 
  await page.waitForSelector('#app');

  // Fill out transaction form
  await page.fill('input[placeholder="Ny utgift"]', 'Tågbiljett');
  await page.fill('input[placeholder="Summa"]', '50');
  await page.selectOption('select#transaction-types-list', { label: 'Utgifter' });
  await page.fill('input[type="date"]', '2024-03-17');

  // Click on save button
  await page.click('button#save');

  // Wait for the summary to update
  await page.waitForSelector('#summary-header-container');

  // Check if total balance updated
  const totalBalance = await page.textContent('#summary-header-container p:nth-child(3)');
  expect(totalBalance.trim()).toBe('Total Balans: -140 Kr');
});

test('Editing a transaction updates total balance', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/'); 
  await page.waitForSelector('#app');

  // Click on edit button of first transaction
  await page.click('#added-expenses li:nth-child(1) button:nth-child(2)');

  // Update transaction details
  await page.fill('#added-expenses input[type="text"]', 'Updated Title');
  await page.fill('#added-expenses input[type="number"]', '100');

  // Click on save button
  await page.click('#added-expenses button:nth-child(5)');

  // Wait for the summary to update
  await page.waitForSelector('#summary-header-container');


  const totalBalance = await page.textContent('#summary-header-container p:nth-child(3)');
  expect(totalBalance.trim()).toBe('Total Balans: -130 Kr'); 
});

test('Deleting a transaction updates total balance', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/'); //
  await page.waitForSelector('#app');


  await page.click('#added-expenses li:nth-child(1) button:nth-child(1)');


  await page.waitForSelector('#summary-header-container');


  const totalBalance = await page.textContent('#summary-header-container p:nth-child(3)');
  expect(totalBalance.trim()).toBe('Total Balans: -30 Kr'); 
});