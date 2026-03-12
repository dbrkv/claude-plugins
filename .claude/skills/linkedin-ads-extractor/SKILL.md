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
  5. Extract ad data
  6. IF successful:
     - Set status to "completed"
     - Store extracted data in ad_data field
     - stats.completed++
  7. IF failed:
     - Set status to "failed"
     - Store error message in error field
     - stats.failed++
  8. stats.pending--
  9. Log: "✓ Completed [INDEX] - [completed/total] done, [pending] remaining"
  10. IF stats.completed % 10 == 0: Save checkpoint file
  11. Continue to next pending URL
```

**PROGRESS LOGGING (REQUIRED for each URL):**
- START: `"▶ Processing [X] of [TOTAL] ([Z%])"`
- END: `"✓ Completed [X] - [done/total] done, [remaining] remaining"`

**CHECKPOINT SAVES:**
- Every 10 completed extractions, write `linkedin_ads_checkpoint_[timestamp].json`
- Include current `url_tracking` array with all statuses
- This allows resuming if interrupted

**FORBIDDEN ACTIONS:**
- ❌ You may NOT stop while `stats.pending > 0`
- ❌ You may NOT skip URLs
- ❌ You may NOT decide "representative sample is enough"
- ❌ You may NOT leave any URL with `status: "pending"` at the end

**Start processing the first URL (index 1) now:**

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

### Handling Large Datasets (50+ URLs)

**If more than 50 URLs collected:**

1. **Process in batches of 20 ads**
   - After each batch, log: "Batch complete: [X] ads processed, [Y] remaining"
   - Brief pause (2-3 seconds) between batches using `mcp__playwright__browser_wait_for`

2. **Checkpoint after each batch**
   - Save intermediate results with current `url_tracking` state
   - Allows resuming if interrupted

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
6. ✅ **Save checkpoints every 10 ads** - Intermediate saves with current tracking state
7. ✅ **Parse the snapshot YAML carefully** - all data is in the snapshot structure
8. ✅ **Click "…see more" button** if present to get full ad text
9. ✅ **Click "Show more" button** in Impressions section if present to get all countries
10. ✅ **Click "x others" buttons** in targeting section if present to get complete lists
11. ✅ **Wait for content to load** after clicking expand buttons (1-2 seconds)
12. ✅ **Take new snapshot** after each expansion to capture revealed content
13. ✅ **Handle missing country data** - some ads (< 1k impressions) have NO country breakdown
14. ✅ **Use arrays** for languages and locations (even if only 1 item)
15. ✅ **DO NOT create "by_date" field** - Impressions are country-based only

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
- ❌ **CRITICAL: Not creating `url_tracking` array before processing** (must initialize first!)
- ❌ **CRITICAL: Stopping while `stats.pending > 0`** (MUST process ALL URLs)
- ❌ **CRITICAL: Leaving URLs with `status: "pending"`** (all must be completed or failed)
- ❌ Not updating URL status after processing (must set to completed/failed)
- ❌ Processing URLs out of order (process index 1, 2, 3... in sequence)
- ❌ Not logging progress for each URL (user has no visibility)
- ❌ Not saving checkpoints every 10 ads (data lost if interrupted)
- ❌ Deciding "representative sample" is sufficient (process EVERYTHING)
- ❌ Not parsing the snapshot YAML carefully (all data is there!)
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
- [ ] `impressions.by_country` array exists (may be empty for low-impression ads)
- [ ] If country data exists, `by_country` has more than 4 entries (proves "Show more" was clicked)
- [ ] `impressions.total_range` is present
- [ ] No `impressions.by_date` field exists
- [ ] `targeting.languages` is an array
- [ ] `targeting.locations` is an array
- [ ] All available data from the snapshot was extracted
