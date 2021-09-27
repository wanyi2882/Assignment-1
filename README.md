# Pre-School Locator

>Noticing more people of my age becoming parents, and as they look for Infant Care or Pre-Schools near their homes or workplaces, this idea bloomed.

>This website consolidates all the pre-schools available in Singapore as provide by the data.gov.sg. 

>The purpose of this webpage is to help parents look for a pre-school near a specified location.

>Through this webiste, parents can easily locate childcare centres near a specified postal code, filter centres according to distance and do a comparison between two centres.

> URL: https://5506-azure-emu-to0ccdiz.ws-us18.gitpod.io/index.html

## Project Complexity Matrix



## Features
* A search bar where the user can enter their postal code to search for pre-schools near the mentioned postal code
* User can filter to see pre-schools which aare 'SPARK Certified' on the map
* User can also filter to see the pre-schools which are within 100 metres, 500metres and 1 Kilometre distance from the searched postal code on the map
* User can do a comparison between two pre-schools

## Structure of Website

1. User arrives at home page of the website and keys in the postal code of their desired location (i.e. Home, Workplace, etc) and hits the 'Go' button to search

2. After user hits the 'Go' button, it will bring the user to the page showing user's searched location on the map with a "You are here!" popup.

3. User can then see all the markers on the map that is near the searched location.

4. Map distance filter buttons allows the user to toggle to show or hide markers which are within a certain radius from the searched postal code

5. There is a also a map filter which can toggle to show or hide markers of pre-schools which are 'SPARK Certified'

6. Inside each individual marker popup, there is a 'Add to Compare' button which allows user to add up to 2 pre-schools for comparison.

7. Once the user has added 2 pre-schools, which will be indicated at the bottom of the page

8. The user can also remove the pre-school(s) from the comparison if he/she wants to select another pre-schools by clicking on the 'cross' button

9. Once user has selected 2 pre-schools and is ready to compare them, he/she can then click on the 'Compare' button.

10. Upon clicking on the 'Compare' button, it will bring the user to the comparison page which displays a table showcasing information on the pre-school such as opening hours, availability of services for the different age groups, any special dietary offered as well as the second languages offered.

## Technologies Used

1. HTML
-  A markup language which provides the structure of a website to be displayed on web browsers.

2. CSS (Cascading Style Sheet)
-  A style sheet language used for describing the presentation of a document written in this HTML page.

3. JavaScript
- Programming language which creates dynamic behaviour to a webpage. It will execute actions and create interaction between the website and their users.

4. Bootstrap
- Framework for building responsive, mobile-first sites.

5. Leaflet
- Open-source JavaScript library for mobile-friendly interactive maps. 

6. Geocoding API
- From https://geocode.xyz/api which returns the latitude and longtitude of a given postal code in JSON format

7. Axios
- Promise based HTTP client for the browser

8. Font Awesome
- Library with icon set and toolkit for website 

9. Google Fonts
- Library which includes free and open source font families

10. Csvtojson
- CSV Parser which converts CSV files to JSON format

## Visual Design
- Colors
- Typography
- Font size
- Layout
- Strategy for achieving mobile responsiveness: Website was built from mobile size and eventually for Ipad and Laptop display

## Testing Steps


| Test Case # | Test Case Description | Test Steps| Expected Result | 
|-------------|:---------------------:|----------:|----------------:|
|             |Prerequisite: The user is at landing page.           |    
| 01.| Search for pre-school by postal code| 1) User enters postal code as "680213" <br><br> 2) User enters postal code as "68021" (short of one 1 digit) <br><br> 3) User enters postal code as "abc123" (Postal code containing numbers)|1) Goes to page displaying map <br><br> 2) Alert user to key a 6 digit postal code <br><br> 3) Alert usert to key a 6 digit postal code|
||Prerequisite: User sucessfully keys in postal code and arrives at page displaying map|||    
| 02.| Adding pre-school for comparison| 1) User clicks on the individual popups which will have the "Add to Compare" button. User selects one popup and clicks the "Add to Compare" button <br><br> 2) User tries to add more than 2 pre-schools for comparison| 1) The pre-school gets added to comparison preview table at the bottom of the page <br><br> 2) Alert user that they can only add a maximum of 2 pre-schools |
|03.| Comparing pre-school | 1) User has added 2 pre-schools to the comparison preview table (Which will be displayed at the bottom of the page) and clicks "Start Compare" button <br><br> 2) User only selected 1 pre-school and hits the the "Start Compare" button| 1) Brings user to the comparison table page comparing between the 2 selected pre-schools <br><br> 2) Alert User to add in at least 2 pre-schools for comparison |


## Future Features Implementation
1. 

## Credits
