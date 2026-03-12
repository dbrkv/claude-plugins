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

#### About the Ad Section
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

#### Impressions Section
- **Total Impressions** - Number of times ad was shown
- **Impressions by Date Range** - If available
- **Reach** - Number of unique users (if available)

#### Ad Targeting Section
- **Location/Geography** - Targeted countries, regions, cities
- **Demographics** - Age ranges, gender
- **Job Titles** - Targeted professional roles
- **Industries** - Targeted industry sectors
- **Company Size** - Employee count ranges
- **Seniority Levels** - Entry, Manager, Director, VP, C-level
- **Skills** - Targeted professional skills
- **Interests** - Targeted member interests
- **Education** - Targeted degrees, fields of study, universities
- **Member Groups** - LinkedIn groups targeted
- **Custom Audiences** - If applicable

4. **Return to search results** using `mcp__playwright__browser_navigate_back` or store URL and navigate back to main search

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
        "format": "<format>",
        "creative_urls": ["<url1>", "<url2>"],
        "headline": "<text>",
        "description": "<text>",
        "cta": "<text>",
        "landing_page": "<url>",
        "status": "<status>",
        "start_date": "<date>",
        "end_date": "<date>"
      },
      "impressions": {
        "total": <number>,
        "by_date": [
          {"date": "<date>", "impressions": <number>}
        ]
      },
      "targeting": {
        "locations": ["<location1>", "<location2>"],
        "demographics": {
          "age_ranges": ["<range1>"],
          "gender": ["<gender>"]
        },
        "job_titles": ["<title1>"],
        "industries": ["<industry1>"],
        "company_sizes": ["<size1>"],
        "seniority": ["<level1>"],
        "skills": ["<skill1>"],
        "interests": ["<interest1>"],
        "education": ["<edu1>"]
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

## Important Notes

### Playwright MCP Tools to Use
- `mcp__playwright__browser_navigate` - Navigate to URLs
- `mcp__playwright__browser_snapshot` - Capture page structure
- `mcp__playwright__browser_evaluate` - Execute JavaScript for scrolling
- `mcp__playwright__browser_wait_for` - Wait for content to load
- `mcp__playwright__browser_navigate_back` - Return to previous page
- `mcp__playwright__browser_click` - Click elements if needed

### Handling Challenges
- **Infinite scroll**: Always scroll 3 times to load more content
- **Dynamic content**: Use wait_for after each scroll
- **Multiple pages**: Handle pagination if present
- **Missing data**: Use `null` or empty arrays for unavailable fields
- **Rate limiting**: If page loads slowly, increase wait times

### Error Handling
- If an ad detail page fails to load, skip it and continue
- Log any errors encountered during extraction
- Always attempt to capture as much data as possible

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
6. Extract all available structured data
7. Save to JSON file

## Output Files

- `linkedin_ads_<company>_<timestamp>.json` - Full structured data
- `linkedin_ads_<company>_<timestamp>.csv` - Tabular format (optional, if requested)
