---
name: linkedin-ads-library-extractor
description: Extract information from LinkedIn Ad Library search results. Use this skill whenever the user wants to scrape, extract, or analyze LinkedIn ads data, mentions LinkedIn Ad Library, or needs to get ad information from LinkedIn's ad library. This includes requests to extract ads by company, analyze competitor ads, or gather advertising intelligence from LinkedIn.
compatibility: []
---

# LinkedIn Ad Library Extractor

You are a specialized skill for extracting information from the LinkedIn Ad Library. Your job is to navigate to a given LinkedIn Ad Library URL, extract ad information from the search results, and output the data in a structured format.

## Inputs

You will receive:
- **url**: A LinkedIn Ad Library search URL (e.g., `https://www.linkedin.com/ad-library/search?accountOwner=wise&payer=wise`)
- **max_scrolls**: (Optional) Maximum number of scrolls to perform. Default is 3. LinkedIn has infinite scroll, so this prevents endless extraction.
- **max_ads**: (Optional) Maximum total ads to collect. Default is 50. Stops extraction once this many unique ads are collected.
- **include_detail_pages**: (Optional) Whether to visit individual ad detail pages. Default is false for faster extraction. Set to true only if you need fields not available in list view (destination URLs, full impressions data, detailed targeting).

## What to Extract

For each ad on the search results page, extract the following information:

### From the Search Results (list view)
1. **advertiser_name**: The name of the company/organization running the ad
2. **ad_type**: The type of ad (e.g., "Single Image Ad", "Video Ad", "Message Ad", "Article Ad", "Document Ad")
3. **ad_headline**: The main heading text of the ad (if present)
4. **ad_description_preview**: The preview text snippet shown in the search results
5. **ad_detail_url**: The URL to the ad detail page (from the "View details" link)

### From the Ad Detail Page
When visiting each ad's detail page, extract additional information:

1. **full_ad_description**: The complete ad description text
2. **destination_url**: The URL the ad links to (if present)
3. **ad_format**: The format from "About the ad" section
4. **paid_for_by**: Who paid for the ad (e.g., "Paid for by Wisemen bv")
5. **ad_duration**: When the ad ran (e.g., "Ran from Mar 10, 2026 to Mar 10, 2026")
6. **total_impressions**: The total impressions shown (e.g., "< 1k")
7. **targeting_info**: Any targeting information available:
   - **language**: Language targeting
   - **location**: Location targeting
   - Other targeting parameters if visible

## Process

This skill uses a **two-pass approach** for optimal performance:

### Pass 1: Fast List-View Extraction (Default)
Extract all available data from the list view without visiting detail pages. This is 3-10x faster.

### Pass 2: Detail Page Enrichment (Optional)
Only if `include_detail_pages=true`, visit individual ad detail pages for additional fields not available in list view.

### Step-by-Step Workflow

1. **Navigate to the provided URL** using the Playwright browser MCP

2. **Initialize tracking**:
   - Create an empty Set for deduplication: `seenAdIds = new Set()`
   - Initialize empty array: `allAds = []`
   - Set scroll counter: `scrollCount = 0`
   - Track consecutive empty scrolls: `emptyScrollCount = 0`

3. **Extract the total ad count** from the heading (e.g., "2,529 ads match your search criteria")

4. **Loop until limits are reached**:
   - Stop if `scrollCount >= max_scrolls`
   - Stop if `allAds.length >= max_ads`
   - Stop if no more content loads

   For each iteration:

   a. **Extract ads from current view** using the bundled snippet:
   ```
   Run the JavaScript from `snippets/extract_ads_from_list_view.js` via `browser_run_code`
   This returns all visible ads with their IDs, advertiser names, types, headlines, descriptions, and detail URLs
   ```

   b. **Deduplicate ads**:
   ```
   For each ad returned:
     if ad.id is not in seenAdIds:
       add to allAds array
       add ad.id to seenAdIds
   ```

   c. **Check if we've hit the ad limit**:
   ```
   If allAds.length >= max_ads:
     break the loop (we have enough ads)
   ```

   d. **If include_detail_pages=true** and there are new ads:
   ```
   For each new ad (not previously processed):
     1. Use browser_tabs to open a new tab
     2. Navigate to the ad's detail_url
     3. Run `snippets/extract_detail_page.js` via browser_run_code
     4. Merge the returned detail data into the ad object
     5. Close the detail tab and return to search results
   ```

   e. **Scroll to load more** using the bundled snippet:
   ```
   Run the JavaScript from `snippets/scroll_and_wait.js` via `browser_run_code`
   Increment scrollCount

   If endOfResults=true:
     break the loop (reached end of results)

   If newAdCount=0:
     increment emptyScrollCount
     If emptyScrollCount >= 3:
       break the loop (no more content loading)
   Else:
     reset emptyScrollCount to 0
   ```

5. **Output the results** in JSON format to a file named `linkedin_ads_data.json`:

```json
{
  "search_url": "the original search URL",
  "total_ads_count": "number from the page header",
  "ads_collected": number_of_ads_extracted,
  "ads": [
    {
      "advertiser_name": "Wisemen",
      "ad_type": "Single Image Ad",
      "ad_headline": "Benieuwd naar wat mogelijk is voor jouw zorgorganisatie?",
      "ad_description_preview": "Planning in thuiszorg voelt vaak als een dagelijkse puzzel...",
      "full_ad_description": "Complete ad description text...",
      "destination_url": "https://wisemen.digital/...",
      "ad_detail_url": "https://www.linkedin.com/ad-library/detail/1365413356",
      "paid_for_by": "Paid for by Wisemen bv",
      "ad_duration": "Ran from Mar 10, 2026 to Mar 10, 2026",
      "total_impressions": "< 1k",
      "targeting_info": {
        "language": "Targeting includes English",
        "location": "Targeting includes Flemish Brabant, Limburg and 1 others"
      }
    }
  ]
}
```

## Important Notes

- **LinkedIn has infinite scroll**: The page will keep loading ads indefinitely. Always use `max_scrolls` and/or `max_ads` to limit extraction. Default limits are 3 scrolls and 50 ads.
- **Use bundled snippets**: Always use the JavaScript snippets in `snippets/` directory via `browser_run_code` for efficient extraction
- **List view is fast**: Default mode (without detail pages) extracts ~5-10 seconds per scroll
- **Detail pages are slow**: Only use `include_detail_pages=true` when you need destination URLs, full impressions data, or detailed targeting info
- **Deduplication is automatic**: The Set-based tracking prevents duplicate ads across scroll loads
- **Expand buttons are handled**: Snippets automatically click "See more" and "X others" buttons
- **Be patient with page loads**: LinkedIn pages can take time to load, especially with infinite scroll
- **Handle dynamic content**: Ads load asynchronously, so wait for content to appear before extracting
- **Rate limiting**: Don't navigate too quickly between pages to avoid being flagged
- **Incomplete data**: Some fields may not be available for all ads; use null or empty string for missing data
- **Multiple tabs**: When visiting detail pages, use tab management to avoid losing the search results page

## Error Handling

Use per-ad error handling to ensure extraction continues even if individual ads fail:

```javascript
// For each ad, wrap extraction in try-catch
try {
  // Extract ad data
} catch (error) {
  // Log the error but continue with other ads
  console.error(`Failed to extract ad ${adId}: ${error.message}`);
  // Add partial data with error annotation
  allAds.push({
    id: adId,
    error: error.message,
    // Include any partial data collected
  });
}
```

If you encounter issues:
- If a detail page fails to load, skip that ad and note it in the output with error details
- If scrolling doesn't load new ads after 3 consecutive attempts, consider it the end of results
- If the page structure changes significantly, inform the user about the issue
- If snippets fail to execute, fall back to manual snapshot-based extraction

## Output File

Save the final JSON output to `linkedin_ads_data.json` in the current working directory. Report to the user:
- Total ads found (from the page header)
- Number of ads actually extracted (unique ads after deduplication)
- Pages processed
- Extraction mode used (list-view-only or with detail pages)
- Path to the output file
- Any issues or errors encountered during extraction

## Bundled Resources

This skill includes reusable JavaScript snippets in the `snippets/` directory:

### `snippets/extract_ads_from_list_view.js`
Extracts all visible ads from the current list view in one efficient call. Handles:
- Clicking "See more" buttons to expand truncated content
- Extracting advertiser name, ad type, headline, description, and detail URL
- Returning structured JSON array of ad objects

Usage: `browser_run_code` with the content of this snippet

### `snippets/extract_detail_page.js`
Extracts complete ad data from an individual ad's detail page. Handles:
- Clicking "X others" buttons to reveal full targeting info
- Extracting full description, destination URL, format, paid for by, duration, impressions
- Returning structured JSON object with all detail page fields

Usage: `browser_run_code` with the content of this snippet

### `snippets/scroll_and_wait.js`
Scrolls to bottom and waits for new content to load. Handles:
- Scrolling to bottom of page
- Waiting for loading indicators
- Detecting new ad count
- Determining if more content is available
- Detecting end-of-results messages
- Respecting max_ads limit

Returns: Object with `newAdCount`, `hasMore`, `totalAds`, `endOfResults`, and `hitAdLimit`

Usage: `browser_run_code` with the content of this snippet. The caller should track scroll count and stop when limits are reached.
