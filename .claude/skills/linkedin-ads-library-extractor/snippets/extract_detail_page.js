/**
 * Extract complete ad data from a LinkedIn Ad Library detail page
 * This should be run via Playwright MCP's browser_run_code tool
 * when on an individual ad's detail page
 *
 * Returns an object with all available detail page information
 */
async (page) => {
  // CRITICAL: First, expand ALL "X others" buttons to reveal full targeting info
  // These can appear in ANY targeting category (Language, Location, Job, etc.)
  try {
    const othersButtons = await page.getByRole('button', { name: /\d+\s+others?/i }).all();
    for (const button of othersButtons) {
      try {
        await button.click();
        await page.waitForTimeout(150);
      } catch (e) {
        // Continue even if a button fails
      }
    }
    // Wait for all expanded content to render
    await page.waitForTimeout(300);
  } catch (e) {
    // No "others" buttons - continue
  }

  // Also expand "see more" for descriptions
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

  await page.waitForTimeout(200);

  // Extract using evaluate for DOM access with heading-based navigation
  const adData = await page.evaluate(() => {
    const result = {
      full_ad_description: null,
      destination_url: null,
      ad_format: null,
      paid_for_by: null,
      ad_duration: null,
      total_impressions: null,
      targeting_info: {
        language: null,
        location: null,
        raw: []
      }
    };

    // Helper to find section by h2 heading text
    function findSectionByHeading(headingText) {
      const headings = document.querySelectorAll('h2');
      for (const h of headings) {
        if (h.textContent.trim().toLowerCase().includes(headingText.toLowerCase())) {
          return h.parentElement;
        }
      }
      return null;
    }

    // Extract Ad Impressions using heading-based navigation
    const impressionsSection = findSectionByHeading('Ad Impressions');
    if (impressionsSection) {
      // Find "Total Impressions" text, then get the next paragraph's value
      const paragraphs = impressionsSection.querySelectorAll('p');
      for (let i = 0; i < paragraphs.length - 1; i++) {
        if (paragraphs[i].textContent.includes('Total Impressions')) {
          result.total_impressions = paragraphs[i + 1].textContent.trim();
          break;
        }
      }
    }

    // Extract Ad Targeting using heading-based navigation
    const targetingSection = findSectionByHeading('Ad Targeting');
    if (targetingSection) {
      // Find h3 headings for each targeting category
      const h3s = targetingSection.querySelectorAll('h3');
      h3s.forEach(h3 => {
        const category = h3.textContent.trim().toLowerCase();
        const valueEl = h3.nextElementSibling;
        if (valueEl) {
          const value = valueEl.textContent.trim();
          // Remove "Targeting includes" prefix
          const cleanValue = value.replace(/^Targeting includes\s+/i, '');

          if (category.includes('language')) {
            result.targeting_info.language = cleanValue;
          } else if (category.includes('location')) {
            result.targeting_info.location = cleanValue;
          }
          result.targeting_info.raw.push({ category: h3.textContent.trim(), value: cleanValue });
        }
      });
    }

    // Extract About the ad section
    const aboutSection = findSectionByHeading('About the ad');
    if (aboutSection) {
      const paragraphs = aboutSection.querySelectorAll('p');
      paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (text.startsWith('Paid for by')) {
          result.paid_for_by = text;
        } else if (text.match(/^Ran from/)) {
          result.ad_duration = text;
        } else if (text.match(/^(Single Image|Video|Message|Article|Document)/)) {
          result.ad_format = text;
        }
      });
    }

    // Extract destination URL from links (look for utm parameters or external links)
    const links = document.querySelectorAll('a[href*="utm"], a[href^="http"]:not([href*="linkedin.com"])');
    if (links.length > 0) {
      result.destination_url = links[0].href;
    }

    // Also try extracting URL from displayed text
    const urlText = document.body.innerHTML.match(/href="(https?:\/\/[^"]*(?:utm|destination)[^"]*)"/);
    if (urlText && !result.destination_url) {
      result.destination_url = urlText[1];
    }

    // Extract full description - try multiple approaches
    // First try p with dir="ltr" (common for ad descriptions)
    const descEl = document.querySelector('p[dir="ltr"]');
    if (descEl && descEl.textContent.trim().length > 20) {
      result.full_ad_description = descEl.textContent.trim();
    }

    // Fallback: look for data-testid or other selectors
    if (!result.full_ad_description) {
      const altDescSelectors = [
        '[data-testid="ad-description"]',
        '[data-anonymize="ad-description"]',
        '.ad-description-full',
        'p[class*="description"]'
      ];
      for (const selector of altDescSelectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent.trim().length > 20) {
          result.full_ad_description = el.textContent.trim();
          break;
        }
      }
    }

    // Last resort: look for long paragraph text in the ad content area
    if (!result.full_ad_description) {
      const allParagraphs = document.querySelectorAll('p');
      for (const p of allParagraphs) {
        const text = p.textContent.trim();
        // Look for paragraphs that are reasonably long and don't match other patterns
        if (text.length > 30 &&
            !text.startsWith('Paid for by') &&
            !text.startsWith('Ran from') &&
            !text.includes('Targeting includes') &&
            !text.includes('Total Impressions')) {
          result.full_ad_description = text;
          break;
        }
      }
    }

    return result;
  });

  return adData;
}
