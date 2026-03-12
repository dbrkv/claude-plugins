/**
 * Extract all ads visible in the current list view of LinkedIn Ad Library
 * This should be run via Playwright MCP's browser_run_code tool
 *
 * Returns an array of ad objects with data available in the list view
 */
async (page) => {
  // First, expand any "See more" buttons to get full text
  try {
    const seeMoreButtons = await page.getByRole('button', { name: /see more/i }).all();
    for (const button of seeMoreButtons) {
      try {
        await button.click();
        await page.waitForTimeout(100); // Brief wait for content to expand
      } catch (e) {
        // Individual button failures are OK
      }
    }
  } catch (e) {
    // No see more buttons or other issue - continue
  }

  // Wait a moment for any expanded content to render
  await page.waitForTimeout(200);

  // Extract ad data using JavaScript evaluation
  const ads = await page.evaluate(() => {
    const adElements = document.querySelectorAll('[data-urn*="ad"]'); // LinkedIn ads have data-urn attributes
    const results = [];

    for (const el of adElements) {
      try {
        // Find the parent list item that contains all ad information
        const listItem = el.closest('li') || el.closest('[role="listitem"]');
        if (!listItem) continue;

        // Extract ad ID from data-urn or link
        const adLink = listItem.querySelector('a[href*="/ad-library/detail/"]');
        const detailUrl = adLink ? adLink.href : null;
        const adId = detailUrl ? detailUrl.split('/detail/')[1]?.split('/')[0] : null;

        if (!adId) continue; // Skip if no valid ID found

        // Extract advertiser name - typically in a specific div or heading
        const advertiserEl = listItem.querySelector('[data-anonymize="advertiser-name"], .artdeco-entity-lockup-title, h3, h4');
        const advertiserName = advertiserEl ? advertiserEl.textContent.trim() : '';

        // Extract ad type - usually in a badge or label
        const typeEl = listItem.querySelector('[data-anonymize="ad-format"], .ad-format-badge, span[class*="ad-type"]');
        const adType = typeEl ? typeEl.textContent.trim() : '';

        // Extract headline
        const headlineEl = listItem.querySelector('[data-anonymize="ad-title"], h2, h3, .ad-headline');
        const adHeadline = headlineEl ? headlineEl.textContent.trim() : '';

        // Extract description - may need to get text from multiple elements
        const descEl = listItem.querySelector('[data-anonymize="ad-description"], .ad-description, p');
        const adDescription = descEl ? descEl.textContent.trim() : '';

        // Extract media type indicator if present (single image, video, etc.)
        const mediaIconEl = listItem.querySelector('[data-testid*="media-icon"], svg[class*="media"]');
        let mediaType = '';
        if (mediaIconEl) {
          // Check aria-label or class to determine type
          mediaType = mediaIconEl.getAttribute('aria-label') || '';
        }

        results.push({
          id: adId,
          advertiser_name: advertiserName,
          ad_type: adType || mediaType || 'Unknown',
          ad_headline: adHeadline,
          ad_description_preview: adDescription,
          ad_detail_url: detailUrl
        });
      } catch (err) {
        // Skip problematic ads but continue extraction
        console.warn('Error extracting individual ad:', err);
      }
    }

    return results;
  });

  return ads;
}
