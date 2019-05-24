# SelfProjects_Scrap-Results
Scrap Archived Football Results 

## Procedure

### Generating the Raw Data
1. Navigate to the url https://www.oddsportal.com/results/#soccer
2. Select the Country+League for which you wish to extract achive data
3. Press Ctrl+S to to save the web page into the extracts folder.
4. In case the league extends to more than 1 tab, navigate to subsequent tabs and save the contents accordingly. Ensure that you do not over-write the earlier saved content (use a suffix on the filename, to give it a unigue fiename).
5. When done with the above, run the following script at the command prompt: npm run extract. This script will extract the results from the stored websites and store then in a JSON array in the extracts - ToConsolidate folder.
6. Run the following script: npm run store. This command will consolidate the individual files in the extracts - ToConsolidate folder and place the resultant consolidated file in the extracts - ToUpload folder.


### Convert JSON to HTML
1. Navigate to the url http://convertjson.com/json-to-html-table.htm
2. Option 1 - Select the raw data file from the step above (ie the file stored in the extracts - ToUpload folder).
3. Option 3 - Select Format JSON
4. Select Convert JSON To HTML.


### Append the results data to your spreadsheet
1. Open a spreadsheet.
2. Place the curser after the last occupied row.
3. Copy the converted data in the Result Data box of the JSON to HTML convertor website and paste it at the cusror position in the spreadsheet.
