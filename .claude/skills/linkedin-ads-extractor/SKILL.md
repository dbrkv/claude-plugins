---
name: linkedin-ads-extractor
description: Extract structured data from LinkedIn Ad Library search results. Use this skill when the user wants to scrape LinkedIn ads, extract ad details from LinkedIn Ad Library, analyze LinkedIn advertising campaigns, or gather competitive intelligence from LinkedIn ads. MUST use Playwright MCP for all browser interactions.
---

# LinkedIn Ads Extractor

Extract comprehensive structured data from LinkedIn Ad Library search results using Playwright MCP.

## When to Use

Use this skill when:
- User provides a LinkedIn Ad Library search URL
- User wants to extract ad data from LinkedIn
- User mentions "LinkedIn ads", "LinkedIn Ad Library", or "extract LinkedIn advertising data"
- User wants competitive ad intelligence from LinkedIn

## Requirements

- **Playwright MCP must be available** - All browser interactions use Playwright MCP tools
- User must provide a LinkedIn Ad Library search URL

## Workflow

### Step 1: Navigate to LinkedIn Ad Library

Use `mcp__playwright__browser_navigate` to open the provided LinkedIn Ad Library search URL.

```
URL format: https://www.linkedin.com/ad-library/search?accountOwner=<company>&payer=<company>
```

### Step 2: Capture Initial Page State

Use `mcp__playwright__browser_snapshot` to capture the page structure and identify:
- Total ad count (look for text like "X ads match your search criteria")
- Ad cards/entries on the page
- Any filters or pagination elements

### Step 3: Scroll to Load More Ads (Infinite Scroll)

LinkedIn Ad Library uses infinite scroll. Execute 3 scroll operations to load additional ads:

```javascript
// Use mcp__playwright__browser_evaluate to scroll
() => {
  window.scrollTo(0, document.body.scrollHeight);
}
```

After each scroll:
1. Wait 2-3 seconds for content to load using `mcp__playwright__browser_wait_for`
2. Take a new snapshot to capture newly loaded ads

### Step 4: Collect Ad URLs & Initialize Tracking

From the final snapshot, extract all ad detail URLs. Each ad card should contain a link to the detail page:

```
https://www.linkedin.com/ad-library/detail/<ad-id>
```

**CRITICAL: Create a tracking array with explicit status for each URL:**

```json
{
  "url_tracking": [
    { "index": 1, "url": "https://www.linkedin.com/ad-library/detail/abc123", "status": "pending", "ad_data": null, "error": null },
    { "index": 2, "url": "https://www.linkedin.com/ad-library/detail/def456", "status": "pending", "ad_data": null, "error": null },
    { "index": 3, "url": "https://www.linkedin.com/ad-library/detail/ghi789", "status": "pending", "ad_data": null, "error": null }
    // ... continue for ALL URLs
  ],
  "stats": {
    "total": 0,
    "pending": 0,
    "in_progress": 0,
    "completed": 0,
    "failed": 0
  }
}
```

**After creating the tracking array:**
1. Log: `"TRACKING INITIALIZED: [X] URLs to process"`
2. Update `stats.total` and `stats.pending` to match the count
3. You MUST process URLs in order: index 1, then 2, then 3, etc.

### Step 5: Extract Detailed Ad Information (EXPLICIT LOOP)

**CRITICAL: You must iterate through `url_tracking` array and process EVERY entry where `status: "pending"`.**

**LOOP INSTRUCTIONS - FOLLOW EXACTLY:**

```
WHILE stats.pending > 0:
  1. Find first URL where status == "pending"
  2. Set status to "in_progress"
  3. Log: "▶ Processing [INDEX] of [TOTAL] ([PERCENTAGE]%) - [URL]"
  4. Navigate to URL
  5. Expand all content (see 5.2 below)
  6. Run extraction script (see 5.3 below)
  7. IF successful:
     - Set status to "completed"
     - Store extracted data in ad_data field
     - stats.completed++
  8. IF failed:
     - Set status to "failed"
     - Store error message in error field
     - stats.failed++
  9. stats.pending--
  10. Log: "✓ Completed [INDEX] - [completed/total] done, [pending] remaining"
  11. Save checkpoint file after each ad: linkedin_ads_progress_[timestamp].json
  12. Continue to next pending URL
```

**PROGRESS LOGGING (REQUIRED for each URL):**
- START: `"▶ Processing [X] of [TOTAL] ([Z%])"`
- END: `"✓ Completed [X] - [done/total] done, [remaining] remaining"`

**CHECKPOINT SAVES:**
- After EACH ad extraction (success or fail), update `linkedin_ads_progress.json`
- This ensures no data is lost if extraction is interrupted
- File shows real-time progress with current `url_tracking` state

**FORBIDDEN ACTIONS:**
- ❌ You may NOT stop while `stats.pending > 0`
- ❌ You may NOT skip URLs
- ❌ You may NOT decide "representative sample is enough"
- ❌ You may NOT leave any URL with `status: "pending"` at the end

**Start processing the first URL (index 1) now:**

#### 5.1 Navigate and Initial Snapshot

1. Navigate to the ad URL using `mcp__playwright__browser_navigate`
2. Wait 1 second using `mcp__playwright__browser_wait_for({ time: 1 })`
3. Take a snapshot using `mcp__playwright__browser_snapshot`

#### 5.2 Expand All Content

**CRITICAL: First expand all content, THEN run extraction script**

From the snapshot, check for and click expand buttons in this order:

**A. Expand Ad Text:**
- Look for button with text "…see more" in the snapshot
- If found, click it using `mcp__playwright__browser_click` and wait 1 second

**B. Expand Impressions (if section exists):**
- Look for heading "Ad Impressions" in the snapshot
- If the section exists, look for button "Show more" within that section
- If found, click it and wait 2 seconds

**C. Expand Targeting (if section exists):**
- Look for heading "Ad Targeting" in the snapshot
- If the section exists, look for buttons matching pattern "\d+ others" (e.g., "1 others", "5 others")
- Click each such button and wait 1 second

#### 5.3 Run Extraction Script

After expanding all content, run the extraction script using `mcp__playwright__browser_run_code`:

```javascript
async (page) => {
  return await page.evaluate(() => {
    // Helper function
    const getText = (el) => el?.textContent?.trim() || null;

    // Extract Ad ID from URL
    const adId = window.location.pathname.split('/').pop();

    // --- Extract About Section (Always Present) ---
    const about = {};

    // Format: First paragraph in About section
    const aboutHeading = Array.from(document.querySelectorAll('h2'))
      .find(h => h.textContent.includes('About the ad'));
    if (aboutHeading) {
      const aboutSection = aboutHeading.parentElement.parentElement;
      const firstParagraph = aboutSection.querySelector('p');
      about.format = getText(firstParagraph);
    }

    // Advertiser
    const advertiserLink = document.querySelector('a[href*="ad_library_about_ad_advertiser"]');
    about.advertiser = getText(advertiserLink);
    about.advertiser_url = advertiserLink?.href || null;

    // Paid for by
    const allParagraphs = Array.from(document.querySelectorAll('p'));
    const paidForByEl = allParagraphs.find(p => p.textContent.includes('Paid for by'));
    about.paid_for_by = paidForByEl?.textContent?.replace('Paid for by', '').trim() || null;

    // Run dates
    const runDatesEl = allParagraphs.find(p => p.textContent.includes('Ran from'));
    if (runDatesEl) {
      const match = runDatesEl.textContent.match(/Ran from (.+?) to (.+)/);
      about.run_start_date = match ? match[1] : null;
      about.run_end_date = match ? match[2] : null;
    } else {
      about.run_start_date = null;
      about.run_end_date = null;
    }

    // --- Extract Ad Content ---
    const content = {};

    // Ad text - find paragraph after "Promoted" label that contains the actual ad copy
    // The ad text paragraph typically contains hashtags or links
    const mainElement = document.querySelector('main');
    const allMainParagraphs = mainElement ? Array.from(mainElement.querySelectorAll('p')) : [];

    // Find the ad text paragraph - it's usually a longer paragraph with links/hashtags
    // Skip "Promoted" and short labels
    let adTextParagraph = null;
    for (const p of allMainParagraphs) {
      const text = p.textContent.trim();
      // Ad text is usually longer than 50 chars or contains hashtags
      if (text.length > 50 || p.querySelector('a[href*="hashtag"]')) {
        adTextParagraph = p;
        break;
      }
    }
    content.ad_text = adTextParagraph ? getText(adTextParagraph) : null;

    // CTA/landing page link
    const ctaLinks = Array.from(document.querySelectorAll('a[href*="lnkd.in"]'));
    content.landing_page = ctaLinks[ctaLinks.length - 1]?.href || null;

    // Hashtags
    content.hashtags = Array.from(document.querySelectorAll('a[href*="hashtag"]'))
      .map(a => a.textContent);

    // Creative URLs (images/videos) - filter out small icons and logos, and profile images
    const images = Array.from(document.querySelectorAll('img'))
      .filter(img => {
        if (!img.src) return false;
        if (img.src.includes('logo')) return false;
        if (img.src.includes('ad_library_ad_preview_advertiser_image')) return false;
        if (img.naturalWidth && img.naturalWidth < 100) return false;
        return true;
      })
      .map(img => img.src);
    const videos = Array.from(document.querySelectorAll('video'))
      .map(v => v.src);
    content.creative_urls = [...images, ...videos];

    // --- Extract Impressions (Optional) ---
    let impressions = null;
    const impressionsHeading = Array.from(document.querySelectorAll('h2'))
      .find(h => h.textContent.includes('Ad Impressions'));

    if (impressionsHeading) {
      impressions = {};
      const section = impressionsHeading.parentElement.parentElement;

      // Total impressions
      const totalEl = Array.from(section.querySelectorAll('p'))
        .find(p => /^[\d<].*k.*$/.test(p.textContent.trim()));
      impressions.total_range = getText(totalEl);

      // Countries - Look for list items with aria-label or in Impressions section
      const countryItems = Array.from(section.querySelectorAll('[role="listitem"]'));
      impressions.by_country = countryItems.map(item => {
        const label = item.getAttribute('aria-label');
        if (label) {
          const match = label.match(/(.+?), impressions (.+%)/);
          if (match) {
            return { country: match[1].trim(), percentage: match[2].trim() };
          }
        }
        return null;
      }).filter(Boolean);

      if (impressions.by_country.length === 0) {
        impressions.by_country = null;
      }
    }

    // --- Extract Targeting (Optional) ---
    let targeting = null;
    const targetingHeading = Array.from(document.querySelectorAll('h2'))
      .find(h => h.textContent.includes('Ad Targeting'));

    if (targetingHeading) {
      targeting = {};
      const section = targetingHeading.parentElement.parentElement;

      // Language
      const langHeading = Array.from(section.querySelectorAll('h3'))
        .find(h => h.textContent.includes('Language'));
      if (langHeading) {
        const langText = langHeading.nextElementSibling?.textContent ||
                         langHeading.parentElement?.querySelector('div > div')?.textContent;
        const langMatch = langText?.match(/Targeting includes (.+)/);
        targeting.languages = langMatch ? [langMatch[1].trim()] : null;
      }

      // Location
      const locHeading = Array.from(section.querySelectorAll('h3'))
        .find(h => h.textContent.includes('Location'));
      if (locHeading) {
        const locText = locHeading.nextElementSibling?.textContent ||
                        locHeading.parentElement?.querySelector('div > div')?.textContent;
        const locMatch = locText?.match(/Targeting includes (.+)/);
        targeting.locations = locMatch ? [locMatch[1].trim()] : null;
      }

      // Targeting details table
      const table = section.querySelector('table');
      if (table) {
        targeting.details = [];
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 3) {
            const parameter = getText(cells[0]);
            if (parameter && parameter !== 'Targeting parameter') {
              targeting.details.push({
                parameter,
                targeted: !!cells[1]?.querySelector('img'),
                excluded: !!cells[2]?.querySelector('img')
              });
            }
          }
        });
        if (targeting.details.length === 0) {
          targeting.details = null;
        }
      }
    }

    return {
      ad_id: adId,
      about,
      content,
      impressions,
      targeting
    };
  });
}
```

#### 5.4 Store Result

Store the returned JSON in the `ad_data` field of the tracking entry. The extraction script returns structured data with:

- `ad_id`: Extracted from URL
- `about`: Format, advertiser, paid_for_by, run dates (null if not available)
- `content`: Ad text, landing page, hashtags, creative URLs
- `impressions`: Total range and country breakdown (null if section doesn't exist)
- `targeting`: Languages, locations, and details table (null if section doesn't exist)

### Handling Large Datasets (50+ URLs)

**If more than 50 URLs collected:**

1. **Process in batches of 20 ads**
   - After each batch, log: "Batch complete: [X] ads processed, [Y] remaining"
   - Brief pause (2-3 seconds) between batches using `mcp__playwright__browser_wait_for`

2. **Progress file updated after each ad**
   - Save results after every single ad extraction
   - Allows resuming if interrupted with no data loss

3. **Continue until `stats.pending == 0`**

### Step 6: Final Output Structure

**When `stats.pending == 0` (ALL URLs processed), create final output:**

```json
{
  "search_metadata": {
    "search_url": "<original-url>",
    "extraction_date": "<ISO-timestamp>",
    "total_urls": 72,
    "successful_extractions": 68,
    "failed_extractions": 4,
    "completion_rate": "100%",
    "success_rate": "94.4%"
  },
  "stats": {
    "total": 72,
    "pending": 0,
    "completed": 68,
    "failed": 4
  },
  "ads": [
    {
      "index": 1,
      "url": "https://www.linkedin.com/ad-library/detail/abc123",
      "status": "completed",
      "ad_data": {
        "ad_id": "abc123",
        "about": {
          "advertiser": "<company>",
          "advertiser_url": "<linkedin_url>",
          "paid_for_by": "<company>",
          "format": "<Single Image Ad|Video Ad|Carousel Ad|etc>",
          "creative_urls": ["<url1>", "<url2>"],
          "ad_text": "<complete_ad_text_after_expansion>",
          "cta": "<text>",
          "landing_page": "<url>",
          "run_start_date": "<YYYY-MM-DD or null>",
          "run_end_date": "<YYYY-MM-DD or null or 'Present'>"
        },
        "impressions": {
          "total_range": "<range_string>",
          "by_country": [
            { "country": "<country_name>", "percentage": "<percentage_string>" }
          ]
        },
        "targeting": {
          "languages": ["<language_1>"],
          "locations": ["<location_1>", "<location_2>"],
          "details": [
            { "parameter": "<parameter_name>", "targeted": true, "excluded": false }
          ]
        }
      }
    }
  ],
  "failed_ads": [
    {
      "index": 5,
      "url": "https://www.linkedin.com/ad-library/detail/xyz999",
      "status": "failed",
      "error": "Page timeout - element not found"
    }
  ],
  "url_tracking": [
    { "index": 1, "url": "...", "status": "completed" },
    { "index": 2, "url": "...", "status": "completed" },
    { "index": 3, "url": "...", "status": "failed", "error": "..." }
  ]
}
```

**VERIFICATION BEFORE FINALIZING:**
- Check that `stats.pending == 0` - if not, you are NOT done
- Check that `url_tracking` has no entries with `status: "pending"`
- Check that `ads` array length equals `stats.completed`
- Check that `failed_ads` array length equals `stats.failed`

### Step 7: Save Results

Save the structured JSON to a file:
- Use a descriptive filename: `linkedin_ads_<company>_<timestamp>.json`
- Also create a CSV version for easier analysis if requested
- Store in the current working directory

## Critical Implementation Rules

### Must-Do Actions (REQUIRED)
1. ✅ **Create `url_tracking` array** - Initialize with ALL URLs before processing any
2. ✅ **Process URLs in order** - index 1, then 2, then 3, etc.
3. ✅ **Update status for each URL** - Set to "in_progress" → "completed" or "failed"
4. ✅ **Continue while `stats.pending > 0`** - Loop must not exit early
5. ✅ **Log progress for each URL** - "▶ Processing X of Y (Z%)"
6. ✅ **Save progress after EACH ad** - Update JSON file after every extraction
7. ✅ **Expand all content FIRST** - Click expand buttons BEFORE running extraction script
8. ✅ **Click "…see more" button** if present to get full ad text
9. ✅ **Click "Show more" button** in Impressions section if present to get all countries
10. ✅ **Click "x others" buttons** in targeting section if present to get complete lists
11. ✅ **Wait for content to load** after clicking expand buttons (1-2 seconds)
12. ✅ **Run extraction script via browser_run_code** - Use the embedded JavaScript
13. ✅ **Handle missing sections** - impressions/targeting will be null if not present
14. ✅ **Use arrays** for languages and locations (even if only 1 item)
15. ✅ **DO NOT create "by_date" field** - Impressions are country-based only

### Error Handling
- If Impressions section heading not found, set impressions to null and continue
- If Targeting section heading not found, set targeting to null and continue
- If run dates not found, set to null and continue
- Never fail an extraction just because optional sections are missing
- If "Show more" button not found, extract visible countries only (or empty array if none)
- If "…see more" button not found, extract visible text only
- If "x others" buttons not found, extract visible language/location only
- Log missing data fields with `null` values
- Continue processing if individual ad fails (don't stop entire extraction)
- Capture screenshots for debugging if critical errors occur

### Button Detection Patterns
| Button Type | Text Pattern | When to Click |
|------------|--------------|---------------|
| Expand ad text | "…see more" | When present in ad preview section |
| Show more countries | "Show more" | When present in Impressions section (after country list) |
| Expand targeting | "\d+ others" (e.g., "1 others", "2 others") | When present in Language/Location fields |

## Extraction Script Output Structure

The JavaScript extraction script returns structured JSON directly:

```json
{
  "ad_id": "1132205244",
  "about": {
    "format": "Single Image Ad",
    "advertiser": "PayU",
    "advertiser_url": "https://www.linkedin.com/...",
    "paid_for_by": "Brand Kolektyw sp. z o.o.",
    "run_start_date": "Jan 28, 2026",
    "run_end_date": "Jan 31, 2026"
  },
  "content": {
    "ad_text": "Complete ad text after expansion...",
    "landing_page": "https://lnkd.in/...",
    "hashtags": ["#payments", "#fintech"],
    "creative_urls": ["https://media.licdn.com/..."]
  },
  "impressions": {
    "total_range": "10k-20k",
    "by_country": [
      { "country": "Poland", "percentage": "100%" }
    ]
  },
  "targeting": {
    "languages": ["English"],
    "locations": ["Poland"],
    "details": [
      { "parameter": "Audience", "targeted": true, "excluded": false }
    ]
  }
}
```

**When sections don't exist**, they return `null`:
```json
{
  "ad_id": "1137287224",
  "about": { ... },
  "content": { ... },
  "impressions": null,
  "targeting": null
}
```

## Important Notes

### Playwright MCP Tools to Use
- `mcp__playwright__browser_navigate` - Navigate to URLs
- `mcp__playwright__browser_snapshot` - Capture page structure to detect expand buttons
- `mcp__playwright__browser_run_code` - Execute JavaScript extraction script (CRITICAL - returns structured data)
- `mcp__playwright__browser_evaluate` - Execute JavaScript for scrolling
- `mcp__playwright__browser_wait_for` - Wait for content to load
- `mcp__playwright__browser_navigate_back` - Return to previous page
- `mcp__playwright__browser_click` - Click expand buttons

### Handling Challenges
- **Infinite scroll**: Always scroll 3 times to load more content
- **Dynamic content**: Use wait_for after each scroll
- **Missing sections**: Some ads have NO Impressions/Targeting sections - extraction script returns null
- **Expandable content**: ALWAYS click "…see more", "Show more", and "x others" buttons BEFORE running extraction script
- **Extraction order**: Expand all content first, THEN run extraction script

### Common Mistakes to Avoid
- ❌ **CRITICAL: Not creating `url_tracking` array before processing** (must initialize first!)
- ❌ **CRITICAL: Stopping while `stats.pending > 0`** (MUST process ALL URLs)
- ❌ **CRITICAL: Leaving URLs with `status: "pending"`** (all must be completed or failed)
- ❌ Not updating URL status after processing (must set to completed/failed)
- ❌ Processing URLs out of order (process index 1, 2, 3... in sequence)
- ❌ Not logging progress for each URL (user has no visibility)
- ❌ Not saving checkpoints after each ad (data lost if interrupted)
- ❌ Deciding "representative sample" is sufficient (process EVERYTHING)
- ❌ Running extraction script BEFORE expanding content (must expand first!)
- ❌ Not clicking "Show more" in Impressions (only extracts 4 countries instead of 60+)
- ❌ Not clicking "…see more" for ad text (extracts truncated text)
- ❌ Not clicking "x others" in targeting (misses complete language/location lists)
- ❌ Creating "by_date" field in impressions (does not exist in LinkedIn Ad Library)
- ❌ Not handling ads with < 1k impressions (they have NO country data)
- ❌ Not using arrays for languages/locations (should always be arrays)

## Output Files

- `linkedin_ads_<company>_<timestamp>.json` - Full structured data with url_tracking
- `linkedin_ads_checkpoint_<timestamp>.json` - Intermediate saves (every 10 ads)
- `linkedin_ads_<company>_<timestamp>.csv` - Tabular format (optional, if requested)

## Verification Checklist

After extraction, verify:
- [ ] **CRITICAL: `stats.pending == 0`** - NO URLs left unprocessed
- [ ] **CRITICAL: `url_tracking` has no `status: "pending"` entries**
- [ ] **CRITICAL: `ads` array length == `stats.completed`**
- [ ] **CRITICAL: `failed_ads` array length == `stats.failed`**
- [ ] JSON is valid and parseable
- [ ] Each ad includes the detail page URL
- [ ] Each ad includes its index from url_tracking
- [ ] Ad text is complete (not truncated with "…")
- [ ] `impressions` is either null or has `total_range` and `by_country`
- [ ] If country data exists, `by_country` has more than 4 entries (proves "Show more" was clicked)
- [ ] No `impressions.by_date` field exists
- [ ] `targeting` is either null or has `languages` and `locations` as arrays
- [ ] Missing sections return null (not empty objects)
