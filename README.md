# 0. Update The Results Archive with the Latest Football Results
Use the procedure below to update the Archives table with footbal results. The Archives table serves as the source for analysis of footbal results in the BetAnalysis and MBetAnalysis spreadsheets

## Procedure

### Generate the Results
1. Navigate to the url https://www.oddsportal.com/results/#soccer
2. Select the day containing the results you wish to archive. This ideally should be the day after the last archived results.
3. Press Ctrl+S and save the web page to the extracts folder (extracts - HTML).

### Update the Archives Table with the Results
1. Open the update_results.js file and ensure that the settings for date (ie date.setDate(date.getDate() - 1);) correspond to the date containing the results to archive relative to today (as shown by -1 in this example).
2. Open a command prompt window and activate the mongo database (mongod --dbpath d:/puntertips/data)
3. Open another command prompt window, navigate to the PunterTips folder (cd /d/puntertips). 
4. Run the script to update the archives table with the latest results above (npm run results)

=======================================================================================

# 1. Perform Analysis of the Latest Archived Results (Done in the BetAnalysis Spreadsheet)
Use the procedure below to generate analysis of results data in the Archive table

## Procedure
1. Open the analysis_archivebets.js script and ensure that the date for the results you wish to analyse is set up correctly in the dateFilter constant (ie const dateFilter = "2019-06-15T21:00:00.000Z"; for analysis of results for 16/6/2019)
2. Run the node script to generate analysis from archives table (npm run betanalysis). This will generate analysis data, which is then placed in the analysis folder (extracts - Analysis) for uploading into the BetAnalysis spreadsheet.
3. Open the BetAnalysis.xlsm file in the analysis folder (c:/PunterTips/analysis) and upload the data above for further analysis.

=======================================================================================

# 2. Generate Analysis for the Current Day Bets
Use the procedure below to generate analysis for bets to pick in the MBetAnalysis spreadsheet.

## Procedure

### Generate the Bets List
1. Navigate to the url https://www.oddsportal.com/results/#soccer
2. Select the day containing the games you with to analyse for bets possibility.
3. Press Ctrl+S and save the web page to the extracts folder (extracts - HTML).

### Update the Bets Table with the Bets List
1. Open the update_bets.js file and ensure that the settings for date (ie date.setDate(date.getDate() + 0);) correspond to the date containing the games to retrieve from the bets list, relative to today (as shown by + 0 in this example).
2. Open a command prompt window and activate the mongo database (mongod --dbpath d:/puntertips/data)
3. Open another command prompt window, navigate to the PunterTips folder (cd /d/puntertips). 
4. Run the script to update the betslist table with the days bets (npm run bets).

### Perform Analysis of the Day Bets (Done in the MBetAnalysis Spreadsheet)
1. Open the analysis_daybets.js script and ensure that the date for the results you wish to analyse is set up correctly in the dateFilter constant (ie const dateFilter = "2019-06-15T21:00:00.000Z"; for analysis of results for 16/6/2019)
2. Run the node script to generate statistical analysis of the day bets from archives table (npm run betlist).
This will generate analysis data, which is then placed in the analysis folder (extracts - Analysis) for uploading into the MBetAnalysis spreadsheet.
3. Open the MBetAnalysis.xlsm file in the analysis folder (c:/PunterTips/analysis) and upload the data above for further analysis.

=======================================================================================

# 3. Generate Analysis for the Jackpot Bets
Use the procedure below to generate analysis for viability of Jackpot bets.

## Procedure

### Generate the Jackpot Bets List
1. Retrieve the MBetsTemplates spreadsheet (from the templates folder) and update as per the bookies jackpot games. Ensure that you get the most reliable odds for the games. When done, ensure that you delete all surplus rows in the spreadsheet.
2. Save the completed spreadsheet (ensure that you do not overwrite the template) in the mbets - files folder.

### Generate the Bets List 
1. Open command prompt window, navigate to the PunterTips folder (cd /d/puntertips). 
2. Run the script to generate the bets list json file (npm run getjps)
3. In the broswer, navigate to localhost:3000
4. Select the saved spreadsheet file and select upload to process the JSON file, which is stored in the extracts - ManualPicks folder.

### Update the Bets Table with the Bets List
1. Open the update_bets.js file and ensure that the settings for date (ie date.setDate(date.getDate() + 0);) correspond to the date containing the games to retrieve from the bets list, relative to today (as shown by + 0 in this example).
2. Open a command prompt window and activate the mongo database (mongod --dbpath d:/puntertips/data)
3. Open another command prompt window, navigate to the PunterTips folder (cd /d/puntertips). 
4. Run the script to update the betslist table with the jackpot bets (npm run mbets).

### Perform Analysis of the Jackpot Bets (Done in the MBetAnalysis Spreadsheet)
1. Open the analysis_mbets.js script and ensure that the date for the results you wish to analyse is set up correctly in the dateFilter constant (ie const dateFilter = "2019-06-15T21:00:00.000Z"; for analysis of results for 16/6/2019)
2. Run the node script to generate statistical analysis of the day bets from archives table (npm run mbetlist).
This will generate analysis data, which is then placed in the analysis folder (extracts - Analysis) for uploading into the MBetAnalysis spreadsheet.
3. Open the MBetAnalysis.xlsm file in the analysis folder (c:/PunterTips/analysis) and upload the data above for further analysis.
