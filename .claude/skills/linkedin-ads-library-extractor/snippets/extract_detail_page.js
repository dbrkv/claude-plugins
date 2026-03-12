/**
 * Extract complete ad data from a LinkedIn Ad Library detail page
 * This should be run via Playwright MCP's browser_run_code tool
 * when on an individual ad's detail page
 *
 * Returns an object with all available detail page information
 */
async (page) => {
  // First, expand any "X others" buttons to reveal full targeting info
  try {
    const othersButtons = await page.getByRole('button', { name: /\d+\s+others?/i }).all();
    for (const button of othersButtons) {
      try {
        await button.click();
        await page.waitForTimeout(100);
      } catch (e) {
        // Individual button failures are OK
      }
    }
  } catch (e) {
    // No "others" buttons - continue
  }

  // Expand any "See more" for descriptions
  try {
    const seeMoreButtons = await page.getByRole('button', { name: /see more/i }).all();
    for (const button of seeMoreButtons) {
      try {
        await button.click();
        await page.waitForTimeout(100);
      } catch (e) {
        // Continue on failure
      }
    }
  } catch (e) {
    // No see more buttons - continue
  }

  // Wait for expanded content to render
  await page.waitForTimeout(200);

  // Extract all detail page data
  const adData = await page.evaluate(() => {
    const result = {
      full_ad_description: null,
      destination_url: null,
      ad_format: null,
      paid_for_by: null,
      ad_duration: null,
      total_impressions: null,
      targeting_info: {}
    };

    // Extract full ad description
    const descSelectors = [
      '[data-anonymize="ad-description"]',
      '.ad-description-full',
      '[data-testid="ad-description"]',
      'p[class*="description"]'
    ];
    for (const selector of descSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        result.full_ad_description = el.textContent.trim();
        break;
      }
    }

    // Extract destination URL
    const urlSelectors = [
      'a[href*="linkedin.com/ad/"]',
      '[data-testid="destination-url"]',
      'a[class*="destination"]'
    ];
    for (const selector of urlSelectors) {
      const el = document.querySelector(selector);
      if (el && el.href) {
        result.destination_url = el.href;
        break;
      }
    }

    // Also check for URL displayed as text (not clickable)
    const urlTextSelectors = [
      '[data-testid="destination-url-text"]',
      'span[class*="destination-url"]'
    ];
    for (const selector of urlTextSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        result.destination_url = el.textContent.trim();
        break;
      }
    }

    // Extract "About the ad" section information
    const aboutSection = document.querySelector('[data-testid="about-the-ad"], section[class*="about"]');
    if (aboutSection) {
      // Ad format
      const formatEl = aboutSection.querySelector('[data-anonymize="ad-format"]');
      if (formatEl) {
        result.ad_format = formatEl.textContent.trim();
      }

      // Paid for by
      const paidEl = aboutSection.querySelector('[data-anonymize="paid-by"]');
      if (paidEl) {
        result.paid_for_by = paidEl.textContent.trim();
      }

      // Duration
      const durationEl = aboutSection.querySelector('[data-anonymize="ad-duration"], [data-testid="ad-duration"]');
      if (durationEl) {
        result.ad_duration = durationEl.textContent.trim();
      }

      // Impressions
      const impressionsEl = aboutSection.querySelector('[data-anonymize="impressions"], [data-testid="impressions"]');
      if (impressionsEl) {
        result.total_impressions = impressionsEl.textContent.trim();
      }
    }

    // Extract targeting information
    const targetingSection = document.querySelector('[data-testid="targeting-section"], section[class*="targeting"]');
    if (targetingSection) {
      const targetingItems = targetingSection.querySelectorAll('[data-anonymize*="targeting"], [data-testid*="targeting"]');

      targetingItems.forEach(item => {
        const label = item.querySelector('[data-anonymize="label"], span[class*="label"]');
        const value = item.querySelector('[data-anonymize="value"], span[class*="value"]');

        if (label && value) {
          const labelText = label.textContent.trim().toLowerCase().replace(/\s+/g, '_');
          result.targeting_info[labelText] = value.textContent.trim();
        }
      });

      // If no structured targeting found, try extracting all text from section
      if (Object.keys(result.targeting_info).length === 0) {
        const sectionText = targetingSection.textContent.trim();
        result.targeting_info = { raw: sectionText };
      }
    }

    // Try alternative approach if above didn't work
    if (!result.full_ad_description) {
      const bodyText = document.body.textContent;
      const match = bodyText.match(/About the ad[:\s]+([^]{0,500})/i);
      if (match && match[1]) {
        result.full_ad_description = match[1].trim();
      }
    }

    return result;
  });

  return adData;
}
