/**
 * Scroll to bottom of page and wait for new content to load in LinkedIn Ad Library
 * This should be run via Playwright MCP's browser_run_code tool
 *
 * IMPORTANT: LinkedIn Ad Library has near-infinite scroll. Always use a scroll limit!
 *
 * Parameters (set via inline replacement before calling):
 *   - maxScrolls: Maximum number of scrolls to perform (default: 3)
 *   - maxAds: Maximum total ads to collect (default: 50)
 *
 * Returns: Object with:
 *   - newAdCount: Number of new ad elements detected after scroll
 *   - hasMore: Boolean indicating if more content appears to be available
 *   - scrollNumber: Current scroll count
 *   - hitScrollLimit: Boolean indicating if max scroll limit was reached
 *   - hitAdLimit: Boolean indicating if max ad limit was reached
 *   - totalAds: Total ads collected so far
 */
async (page, maxScrolls = 3, maxAds = 50) => {
  // Count ads before scroll
  const adsBefore = await page.evaluate(() => {
    return document.querySelectorAll('[data-urn*="ad"]').length;
  });

  // Check if we've already hit the ad limit before scrolling
  if (adsBefore >= maxAds) {
    return {
      newAdCount: 0,
      hasMore: false,
      scrollNumber: 0,
      hitScrollLimit: false,
      hitAdLimit: true,
      totalAds: adsBefore,
      message: `Reached ad limit of ${maxAds}`
    };
  }

  // Scroll to bottom
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  // Wait for loading indicator to disappear and new content to appear
  // LinkedIn shows a loading spinner during content fetch
  try {
    // First wait for potential loading indicator
    await page.waitForSelector('[data-testid="loading"], .spinner, [class*="loading"]', { timeout: 1000 })
      .then(() => page.waitForSelector('[data-testid="loading"], .spinner, [class*="loading"]', { state: 'hidden', timeout: 5000 }))
      .catch(() => {
        // No loading indicator appeared, just wait a bit for content
      });
  } catch (e) {
    // No loading indicator found
  }

  // Wait for new content to potentially load
  await page.waitForTimeout(2000);

  // Additional wait if we see skeleton loaders
  const hasSkeletonLoaders = await page.evaluate(() => {
    return document.querySelectorAll('[class*="skeleton"], [class*="shimmer"]').length > 0;
  });

  if (hasSkeletonLoaders) {
    await page.waitForTimeout(2000);
  }

  // Count ads after scroll
  const adsAfter = await page.evaluate(() => {
    return document.querySelectorAll('[data-urn*="ad"]').length;
  });

  const newAdCount = adsAfter - adsBefore;

  // Check for end-of-results indicators
  const endOfResults = await page.evaluate(() => {
    const endMessages = ['end of results', 'no more ads', 'that\'s all', 'no more results'];
    const bodyText = document.body.textContent.toLowerCase();
    return endMessages.some(msg => bodyText.includes(msg));
  });

  // Check if there's more content to load
  const hasMore = !endOfResults && adsAfter < maxAds;

  return {
    newAdCount,
    hasMore,
    scrollNumber: 1,
    hitScrollLimit: false, // Caller should track scroll count
    hitAdLimit: adsAfter >= maxAds,
    totalAds: adsAfter,
    endOfResults
  };
}
