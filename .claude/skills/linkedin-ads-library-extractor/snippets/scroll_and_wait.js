/**
 * Scroll to bottom of page and wait for new content to load in LinkedIn Ad Library
 * This should be run via Playwright MCP's browser_run_code tool
 *
 * Returns: Object with:
 *   - newAdCount: Number of new ad elements detected after scroll
 *   - hasMore: Boolean indicating if more content appears to be available
 */
async (page) => {
  // Count ads before scroll
  const adsBefore = await page.evaluate(() => {
    return document.querySelectorAll('[data-urn*="ad"]').length;
  });

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

  // Check if there's more content to load by looking for:
  // 1. "End of results" message
  // 2. Loading indicator still present
  // 3. Scroll position near bottom
  const hasMore = await page.evaluate(() => {
    const endMessage = document.body.textContent.includes('end of results') ||
                       document.body.textContent.includes('no more ads');
    const isLoading = document.querySelectorAll('[data-testid="loading"], .spinner, [class*="loading"]').length > 0;
    const nearBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 100;

    return !endMessage && (isLoading || !nearBottom);
  });

  return {
    newAdCount,
    hasMore,
    totalAds: adsAfter
  };
}
