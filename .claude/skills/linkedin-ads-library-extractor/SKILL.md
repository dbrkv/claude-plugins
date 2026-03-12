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
- **max_pages**: (Optional) Maximum number of pages to scroll/load. Default is 10 pages.

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

1. **Navigate to the provided URL** using the Playwright browser MCP

2. **Extract the total ad count** from the heading (e.g., "2,529 ads match your search criteria")

3. **Extract ads from the visible page**:
   - Take a snapshot to identify all ad elements
   - For each ad list item, extract the basic information listed above
   - Collect the "View details" link URL for each ad

4. **Visit each ad detail page** to get additional information:
   - For each ad, open its detail page in a new tab
   - Extract the additional information from the detail page
   - Close the tab and return to the search results

5. **Handle pagination**:
   - LinkedIn Ad Library uses infinite scroll, not traditional pagination
   - Scroll down to trigger loading more ads
   - Wait for new ads to load
   - Repeat extraction for newly loaded ads
   - Continue until max_pages is reached or no more ads load

6. **Output the results** in JSON format to a file named `linkedin_ads_data.json`:

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

- **Be patient with page loads**: LinkedIn pages can take time to load, especially with infinite scroll
- **Handle dynamic content**: Ads load asynchronously, so wait for content to appear before extracting
- **Rate limiting**: Don't navigate too quickly between pages to avoid being flagged
- **Incomplete data**: Some fields may not be available for all ads; use null or empty string for missing data
- **Multiple tabs**: When visiting detail pages, use tab management to avoid losing the search results page
- **Snapshot first**: Always take a snapshot before attempting to extract data to get the latest DOM structure

## Error Handling

If you encounter issues:
- If a detail page fails to load, skip that ad and note it in the output
- If scrolling doesn't load new ads after several attempts, consider it the end of results
- If the page structure changes significantly, inform the user about the issue

## Output File

Save the final JSON output to `linkedin_ads_data.json` in the current working directory. Report to the user:
- Total ads found (from the page header)
- Number of ads actually extracted
- Path to the output file
- Any issues encountered during extraction
