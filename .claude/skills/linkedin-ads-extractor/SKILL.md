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

### Step 5: Extract Detailed Ad Information

For each ad URL collected:

1. **Navigate to ad detail page** using `mcp__playwright__browser_navigate`
2. **Capture page snapshot** using `mcp__playwright__browser_snapshot`
3. **Extract structured data** from the snapshot:

#### A. About the Ad Section
- **Ad ID** - From URL or page
- **Advertiser/Payer** - Company name
- **Ad Format** - (Single image, Video, Carousel, Text, etc.)
- **Ad Creative** - Image URLs, video URLs, or text content
- **Headline/Primary Text** - Main ad copy
- **Description** - Secondary ad copy
- **Call to Action (CTA)** - Button text/link
- **Landing Page URL** - Destination URL
- **Ad Status** - (Active, Inactive, etc.)
- **Run Dates** - Start and end dates if available

**CRITICAL: Expand Truncated Ad Text**
- If you see a "…see more" button or link in the ad text, you MUST click it to expand the full text
- Use `mcp__playwright__browser_click` to click the "…see more" button
- Wait 1 second for content to load
- Take a new snapshot to capture the full ad text
- Extract the complete ad text after expansion

#### B. Impressions Section (CRITICAL - Country-Based, NOT Date-Based)

**IMPORTANT: The Impressions section shows country-based data, NOT date-based breakdown.**

1. **Extract Total Impressions Range**
   - Look for a range value like "30k-50k", "100k-150k", "< 1k"
   - This represents the total impressions across all countries

2. **MUST CLICK "Show more" Button to Reveal All Countries**
   - The Impressions section initially shows only ~4 countries
   - Look for a button with text "Show more" in the Impressions section
   - Click it using:
   ```
   mcp__playwright__browser_click({
     ref: "<button_ref>",
     element: "Show more button in Impressions section"
   })
   ```
   - Wait 2 seconds for content to load
   - Take a new snapshot to capture all revealed countries
   - After clicking, the button changes to "Show less" and reveals 60+ countries

3. **Extract Complete Country List**
   - Country name (e.g., "Germany", "United States", "India")
   - Percentage of total impressions (e.g., "98%", "< 1%", "2%")
   - Extract ALL countries visible after clicking "Show more"

**Example Impressions Data Structure:**
```json
"impressions": {
  "total_range": "30k-50k",
  "by_country": [
    { "country": "Germany", "percentage": "98%" },
    { "country": "India", "percentage": "< 1%" },
    { "country": "United States", "percentage": "< 1%" }
    // ... 60+ countries after clicking "Show more"
  ]
}
```

**DO NOT create a "by_date" field - this does not exist in LinkedIn Ad Library.**

#### C. Ad Targeting Section

**CRITICAL: Expand Hidden Items in Language and Location Fields**

1. **Look for "x others" Buttons**
   - In the Language and Location fields, look for buttons with text matching the pattern `\d+ others`
   - Examples: "1 others", "2 others", "5 others"
   - These buttons indicate additional items that are hidden

2. **Click Each "x others" Button**
   - For each "x others" button found:
   ```
   mcp__playwright__browser_click({
     ref: "<button_ref>",
     element: "x others button in targeting section"
   })
   ```
   - Wait 1 second for inline text expansion
   - The hidden items will be revealed inline

3. **Take New Snapshot After Expansions**
   - After clicking all "x others" buttons, take a new snapshot
   - Extract the complete lists of languages and locations

4. **Extract Targeting Data**
   - **Languages**: Full list of targeted languages (as array)
   - **Locations**: Full list of targeted locations (as array)
   - **Targeting Details Table**:
     - Parameter name (e.g., "Audience", "Age", "Gender")
     - Targeted status (boolean - checkmark present)
     - Excluded status (boolean - X mark present)

**Example Targeting Data Structure:**
```json
"targeting": {
  "languages": ["English", "Spanish", "German"],
  "locations": ["Germany", "France", "United Kingdom"],
  "details": [
    { "parameter": "Audience", "targeted": true, "excluded": false },
    { "parameter": "Age", "targeted": true, "excluded": false },
    { "parameter": "Gender", "targeted": false, "excluded": true }
  ]
}
```

4. **Return to search results** using `mcp__playwright__browser_navigate_back`

### Step 6: Structure the Output

Organize all extracted data into a structured JSON format:

```json
{
  "search_metadata": {
    "search_url": "<original-url>",
    "total_ads_found": <number>,
    "extraction_date": "<ISO-timestamp>",
    "ads_scraped": <number>
  },
  "ads": [
    {
      "ad_id": "<id>",
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
        "languages": ["<language_1>", "<language_2>"],
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
  ]
}
```

### Step 7: Save Results

Save the structured JSON to a file:
- Use a descriptive filename: `linkedin_ads_<company>_<timestamp>.json`
- Also create a CSV version for easier analysis if requested
- Store in the current working directory

## Critical Implementation Rules

### Must-Do Actions (REQUIRED)
1. ✅ **Click "Show more" button** in Impressions section BEFORE extracting countries
2. ✅ **Click "…see more" button** for full ad text if truncated
3. ✅ **Click "x others" buttons** in Ad Targeting section (Language/Location fields) to reveal full lists
4. ✅ **Wait for content to load** after clicking expand buttons (1-3 seconds)
5. ✅ **Take new snapshot** after expanding to capture revealed content
6. ✅ **Handle range values** for impressions (e.g., "30k-50k", "< 1k")
7. ✅ **Parse percentages** from country data (e.g., "98%", "< 1%")
8. ✅ **Extract full lists** from Language and Location after expansion
9. ✅ **Use arrays** for languages and locations (even if only 1 item)
10. ✅ **DO NOT create "by_date" field** - Impressions are country-based only

### Error Handling
- If "Show more" button not found, extract visible countries only and log warning
- If "…see more" button not found, extract visible text only
- If "x others" buttons not found, extract visible language/location only
- Log missing data fields with `null` values
- Continue processing if individual ad fails (don't stop entire extraction)
- Capture screenshots for debugging if critical errors occur

### Button Detection Patterns
| Button Type | Location | Text Pattern | Action |
|------------|----------|--------------|--------|
| Show more countries | Impressions section | "Show more" | Click to reveal 60+ countries |
| See more text | Ad preview section | "…see more" | Click to expand full ad text |
| Show more targeting | Targeting section | `\d+ others` (regex) | Click to expand language/location lists |

## Important Notes

### Playwright MCP Tools to Use
- `mcp__playwright__browser_navigate` - Navigate to URLs
- `mcp__playwright__browser_snapshot` - Capture page structure
- `mcp__playwright__browser_evaluate` - Execute JavaScript for scrolling
- `mcp__playwright__browser_wait_for` - Wait for content to load
- `mcp__playwright__browser_navigate_back` - Return to previous page
- `mcp__playwright__browser_click` - Click expand buttons ("Show more", "…see more", "x others")

### Handling Challenges
- **Infinite scroll**: Always scroll 3 times to load more content
- **Dynamic content**: Use wait_for after each scroll
- **Multiple pages**: Handle pagination if present
- **Missing data**: Use `null` or empty arrays for unavailable fields
- **Rate limiting**: If page loads slowly, increase wait times
- **Expandable content**: ALWAYS click "Show more", "…see more", and "x others" buttons

### Common Mistakes to Avoid
- ❌ NOT clicking "Show more" in Impressions (only extracts 4 countries instead of 60+)
- ❌ NOT clicking "…see more" for ad text (extracts truncated text)
- ❌ NOT clicking "x others" in targeting (misses complete language/location lists)
- ❌ Creating "by_date" field in impressions (does not exist in LinkedIn Ad Library)
- ❌ Not using arrays for languages/locations (should always be arrays)

## Example Usage

**User provides:**
```
Extract LinkedIn ads from this URL: https://www.linkedin.com/ad-library/search?accountOwner=payoneer&payer=Payoneer
```

**Expected behavior:**
1. Navigate to the URL
2. Extract "618 ads match your search criteria" (or similar)
3. Scroll 3 times to load more ads
4. Collect all visible ad detail URLs
5. Visit each ad detail page
6. **Click "…see more" if present to expand ad text**
7. **Click "Show more" in Impressions to reveal all 60+ countries**
8. **Click "x others" in targeting to reveal complete language/location lists**
9. Extract all available structured data
10. Save to JSON file

## Output Files

- `linkedin_ads_<company>_<timestamp>.json` - Full structured data
- `linkedin_ads_<company>_<timestamp>.csv` - Tabular format (optional, if requested)

## Verification Checklist

After extraction, verify:
- [ ] JSON is valid and parseable
- [ ] `impressions.by_country` array exists and contains multiple countries
- [ ] `impressions.by_country` has more than 4 entries (proves "Show more" was clicked)
- [ ] `impressions.total_range` is present
- [ ] No `impressions.by_date` field exists (removed from schema)
- [ ] Each country entry has `country` and `percentage` fields
- [ ] `targeting.languages` is an array (even if only 1 language)
- [ ] `targeting.locations` is an array (even if only 1 location)
- [ ] If "x others" buttons were present, arrays contain more than initial visible items
