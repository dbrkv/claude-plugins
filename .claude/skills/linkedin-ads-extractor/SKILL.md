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

### Step 4: Collect Ad URLs

From the final snapshot, extract all ad detail URLs. Each ad card should contain a link to the detail page:

```
https://www.linkedin.com/ad-library/detail/<ad-id>
```

Store these URLs in a list for processing.

### Step 4.5: Progress Tracking Setup (CRITICAL)

**Before starting ad detail extraction, establish progress tracking:**

1. **Calculate total to process**
   - Count URLs in the collected list
   - Log: "Found X ad URLs to process"

2. **Set up progress logging**
   - Will log progress every 5 ads: "Processing ad X of Y (Z%)"
   - Will save intermediate results every 10 ads

3. **Initialize counters**
   - successful_extractions = 0
   - failed_extractions = 0

**CRITICAL: You MUST process ALL collected URLs unless the user explicitly requests a subset.**

### Step 5: Extract Detailed Ad Information (PROCESS ALL URLS)

**CRITICAL: Process EVERY collected ad URL systematically. Do NOT stop early.**

For each ad URL in the collected list (iterate through ALL):

1. **Log progress** (REQUIRED):
   ```
   "Processing ad [X] of [TOTAL] ([PERCENTAGE]%)"
   ```
   Log this at the START of processing each ad.

2. **Navigate to ad detail page** using `mcp__playwright__browser_navigate`
3. **Capture page snapshot** using `mcp__playwright__browser_snapshot`
4. **Extract structured data** from the snapshot:

#### A. About the Ad Section

Parse the snapshot YAML to extract:

**How to extract from snapshot:**
- **Ad ID**: Extract from the page URL (last segment)
- **Advertiser**: Look for text after "Advertiser" heading or in the company link
- **Format**: Look for "Single Image Ad", "Video Ad", "Carousel Ad", etc.
- **Paid for by**: Look for "Paid for by" text
- **Run dates**: Look for "Ran from [date] to [date]" pattern
- **Ad text**: Extract from the paragraph in the ad preview section
- **Creative URLs**: Extract URLs from image/video links
- **Landing page**: Extract from headline link or CTA button

**CRITICAL: Expand Truncated Ad Text**
1. Look for a button with text "…see more" in the snapshot
2. If found, click it:
   ```
   mcp__playwright__browser_click({
     ref: "<button_ref>",
     element: "…see more button"
   })
   ```
3. Wait 1 second: `mcp__playwright__browser_wait_for({ time: 1 })`
4. Take a new snapshot to capture the full text
5. Extract the complete ad text from the new snapshot

#### B. Impressions Section

**CRITICAL: Two Possible Scenarios**

**Scenario 1: Low Impressions (< 1k)**
Some ads show:
- "Total Impressions: < 1k"
- "Impression data by country may take up to 48 hours to update"
- NO country breakdown available

In this case, extract:
```json
"impressions": {
  "total_range": "< 1k",
  "by_country": []
}
```

**Scenario 2: Higher Impressions (30k-50k, etc.)**
These ads show:
- "Total Impressions: [range]"
- Country breakdown with 4 countries initially visible
- "Show more" button to reveal all countries

**Extraction steps:**
1. Extract "Total Impressions" value (e.g., "30k-50k")
2. Look for a "Show more" button in the Impressions section
3. If found, click it:
   ```
   mcp__playwright__browser_click({
     ref: "<show_more_button_ref>",
     element: "Show more button in Impressions section"
   })
   ```
4. Wait 2 seconds for content to load
5. Take a new snapshot
6. Parse ALL countries from the list (will show 60+ countries after clicking)

**How to parse countries from snapshot:**
Look for list items with pattern like:
```yaml
- listitem:
    - generic "Germany, impressions 98%":
        - generic:
            - paragraph: Germany
            - progressbar
          - paragraph: 98%
```

Extract country name and percentage for each item.

**Example output:**
```json
"impressions": {
  "total_range": "30k-50k",
  "by_country": [
    { "country": "Germany", "percentage": "98%" },
    { "country": "India", "percentage": "< 1%" },
    { "country": "Brazil", "percentage": "< 1%" }
    // ... 60+ countries after clicking "Show more"
  ]
}
```

**DO NOT create a "by_date" field - LinkedIn Ad Library does NOT provide date-based impressions.**

#### C. Ad Targeting Section

**Extract Targeting Data:**

**Languages:**
- Look for "Language" heading
- Extract text like "Targeting includes English"
- Parse the language name(s)

**Locations:**
- Look for "Location" heading
- Extract text like "Targeting includes Germany" or "Targeting includes Flemish Brabant, Limburg and"
- **If you see a button with text like "1 others", "2 others", etc., click it!**
  ```
  mcp__playwright__browser_click({
    ref: "<others_button_ref>",
    element: "x others button in Location field"
  })
  ```
- Wait 1 second and take a new snapshot
- Extract the complete list after expansion

**Targeting Details Table:**
Parse the table with columns: "Targeting parameter", "Targeted", "Excluded"

Look for rows like:
```yaml
- row "Audience":
    - cell "Audience":
        - paragraph: Audience
    - cell:
        - img  # checkmark if targeted
    - cell:
        - img  # X if excluded
```

Extract each parameter and mark targeted/excluded as boolean (true if icon present).

**Example output:**
```json
"targeting": {
  "languages": ["English"],
  "locations": ["Flemish Brabant", "Limburg", "Antwerp"],
  "details": [
    { "parameter": "Audience", "targeted": true, "excluded": false },
    { "parameter": "Demographic", "targeted": false, "excluded": true }
  ]
}
```

5. **Increment counter**:
   - If extraction successful: successful_extractions++
   - If extraction failed: failed_extractions++, log error, continue to next

6. **Save checkpoint every 10 ads**:
   - Write intermediate JSON to file
   - Log: "Checkpoint saved: [X]/[TOTAL] ads processed"

7. **Continue to next URL** - Do NOT stop until all URLs are processed

### Handling Large Datasets

**If more than 50 URLs collected:**

1. **Process in batches of 20 ads**
   - After each batch, log: "Batch complete: [X] ads processed"
   - Brief pause (2-3 seconds) between batches

2. **Checkpoint after each batch**
   - Save intermediate results
   - Allows resuming if interrupted

3. **Continue until all batches complete**

### Step 6: Structure the Output

Organize all extracted data into this JSON structure:

```json
{
  "search_metadata": {
    "search_url": "<original-url>",
    "extraction_date": "<ISO-timestamp>",
    "total_ads_found": <number>,
    "urls_collected": <number>,
    "urls_processed": <number>,
    "successful_extractions": <number>,
    "failed_extractions": <number>,
    "completion_rate": "<percentage>"
  },
  "ads": [
    {
      "ad_id": "<id>",
      "url": "<detail-page-url>",
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
          {
            "country": "<country_name>",
            "percentage": "<percentage_string>"
          }
        ]
      },
      "targeting": {
        "languages": ["<language_1>"],
        "locations": ["<location_1>", "<location_2>"],
        "details": [
          {
            "parameter": "<parameter_name>",
            "targeted": <boolean>,
            "excluded": <boolean>
          }
        ]
      }
    }
  ],
  "failed_ads": [
    {
      "url": "<failed-url>",
      "error": "<error-message>"
    }
  ],
  "all_ad_urls": [
    "<url1>",
    "<url2>"
  ]
}
```

**IMPORTANT:**
- `urls_collected` = total URLs found
- `urls_processed` = URLs attempted
- `successful_extractions` = ads with full details extracted
- `failed_extractions` = URLs that failed processing
- `completion_rate` = (successful / collected) * 100

### Step 7: Save Results

Save the structured JSON to a file:
- Use a descriptive filename: `linkedin_ads_<company>_<timestamp>.json`
- Also create a CSV version for easier analysis if requested
- Store in the current working directory

## Critical Implementation Rules

### Must-Do Actions (REQUIRED)
1. ✅ **Parse the snapshot YAML carefully** - all data is in the snapshot structure
2. ✅ **Click "…see more" button** if present to get full ad text
3. ✅ **Click "Show more" button** in Impressions section if present to get all countries
4. ✅ **Click "x others" buttons** in targeting section if present to get complete lists
5. ✅ **Wait for content to load** after clicking expand buttons (1-2 seconds)
6. ✅ **Take new snapshot** after each expansion to capture revealed content
7. ✅ **Handle missing country data** - some ads (< 1k impressions) have NO country breakdown
8. ✅ **Use arrays** for languages and locations (even if only 1 item)
9. ✅ **DO NOT create "by_date" field** - Impressions are country-based only
10. ✅ **Include the ad detail URL** in the output for reference
11. ✅ **Process ALL collected URLs** - Do NOT stop early unless explicitly instructed
12. ✅ **Log progress every 5 ads** - "Processing ad X of Y (Z%)"
13. ✅ **Save checkpoints every 10 ads** - Intermediate saves for large datasets
14. ✅ **Track success/failure counts** - Maintain accurate extraction counters
15. ✅ **Report completion rate** - Final metadata must show what percentage was processed

### Error Handling
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

## Example: Parsing Snapshot Data

**Example snapshot structure:**
```yaml
- paragraph [ref=e39]:
  - text: "Stel je voor dat je planning geen dagelijkse stress meer is..."
  - link "https://lnkd.in/eS7Ry9PP" [ref=e40]
- button "…see more" [ref=e41]
```

**Extraction:**
- Full text is in the `text` field
- If button "…see more" exists, click it first, then extract full text from new snapshot

**Example country data:**
```yaml
- paragraph: Total Impressions
- paragraph: 30k-50k
- list:
  - listitem:
      - generic "Germany, impressions 98%":
          - generic:
              - paragraph: Germany
            - paragraph: 98%
```

**Extraction:**
- Total: "30k-50k"
- Countries: Extract from each listitem - country name and percentage

## Important Notes

### Playwright MCP Tools to Use
- `mcp__playwright__browser_navigate` - Navigate to URLs
- `mcp__playwright__browser_snapshot` - Capture page structure (CRITICAL - all data comes from here)
- `mcp__playwright__browser_evaluate` - Execute JavaScript for scrolling
- `mcp__playwright__browser_wait_for` - Wait for content to load
- `mcp__playwright__browser_navigate_back` - Return to previous page
- `mcp__playwright__browser_click` - Click expand buttons

### Handling Challenges
- **Infinite scroll**: Always scroll 3 times to load more content
- **Dynamic content**: Use wait_for after each scroll
- **Missing country data**: Some ads have < 1k impressions and NO country breakdown - handle gracefully
- **Expandable content**: ALWAYS click "…see more", "Show more", and "x others" buttons when present
- **Snapshot parsing**: The snapshot YAML contains ALL the data - parse it carefully

### Common Mistakes to Avoid
- ❌ Not parsing the snapshot YAML carefully (all data is there!)
- ❌ Not clicking "Show more" in Impressions (only extracts 4 countries instead of 60+)
- ❌ Not clicking "…see more" for ad text (extracts truncated text)
- ❌ Not clicking "x others" in targeting (misses complete language/location lists)
- ❌ Creating "by_date" field in impressions (does not exist in LinkedIn Ad Library)
- ❌ Not handling ads with < 1k impressions (they have NO country data)
- ❌ Not using arrays for languages/locations (should always be arrays)
- ❌ Not including the ad URL in the output
- ❌ Stopping early after processing only a few ads (process ALL URLs)
- ❌ Not logging progress during long extractions (user has no visibility)
- ❌ Misleading metadata where `ads_scraped` != actual extractions (be accurate)
- ❌ No checkpoint saves (data lost if extraction interrupted)
- ❌ Deciding "representative sample" is sufficient without user approval

## Output Files

- `linkedin_ads_<company>_<timestamp>.json` - Full structured data
- `linkedin_ads_<company>_<timestamp>.csv` - Tabular format (optional, if requested)

## Verification Checklist

After extraction, verify:
- [ ] JSON is valid and parseable
- [ ] Each ad includes the detail page URL
- [ ] Ad text is complete (not truncated with "…")
- [ ] `impressions.by_country` array exists (may be empty for low-impression ads)
- [ ] If country data exists, `by_country` has more than 4 entries (proves "Show more" was clicked)
- [ ] `impressions.total_range` is present
- [ ] No `impressions.by_date` field exists
- [ ] `targeting.languages` is an array
- [ ] `targeting.locations` is an array
- [ ] All available data from the snapshot was extracted
