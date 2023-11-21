# Raku Honyaku ![icon48](https://github.com/DarrenSeng/Raku-Honyaku/blob/main/icons/icon32.png)

A simple extension for extracting Japanese text from part of any webpage.

Scan images or manga panels with Japanese and receive the content in text form along with the English translation.

This project is mainly intended for personal use and for Japanese learning in order to make lookups much more quicker. Strongly recommended to use with [Yomichan](https://github.com/FooSoft/yomichan). 

Raku Honyaku makes use of Google Cloud Vision and Translation APIs. An API key for each user is required, but making one is free.

* [Cloud Vision](https://cloud.google.com/vision/pricing#prices) provides the first 1,000 units per month free
* [Cloud Translation](https://cloud.google.com/translate/pricing) provides the first 500,000 characters per month free

To-Do:
* Draggable window
* Have the popup keep track of API key usage.
* Add Images to the 'How to Use' Section

# How to Use

Setup: 
1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a New Project:
   * If you don't have a project, click on the project name at the top of the screen and select "New Project."
   * Follow the prompts to create a new project and give it a meaningful name.
2. Navigate to API Library:
   * In the Cloud Console, locate the menu icon (three horizontal lines) on the top left and click on it.
   * Select "APIs & Services" > "Library" from the navigation menu.
3. Search for the APIs and enable them:
   * In the API Library, use the search bar to find and enable the following APIs:
     * Google Cloud Vision API: Enables the detection and extraction of text from images.
     * Google Cloud Translation API: Allows the translation of text between different languages.
   * For each API, click on it, and on the API details page, click the "Enable" button.
4. Create API Key:
   * After enabling the necessary APIs, go back to the Cloud Console dashboard. Navigate to "APIs & Services" > "Credentials."
5. Create Credentials:
   * Click on "Create Credentials" and select "API Key." A new API key will be generated. 
6. Copy API Key: 
   * Copy the generated API key. This key will be used in the Raku Honyaku Chrome Extension.

Extension Usage:
1. Extension Popup:
   * Click on the extension icon to open the popup window.
2. Toggle On/Off:
   * In the popup, find the checkbox labeled "ON/OFF" and use it to enable or disable the extension.
3. Enter/Remove API Key:
   * Enter your API Key created from the Setup Instructions into the provided input field.
   * Click "Submit API Key" to save it to Chrome storage. The API Key will automatically be retrieved and used on subsequent Chrome sessions until you press the "Remove Stored API Key" button.
4. Capture and Translate:
   * To extract and translate text from a webpage or selected screen area:
     * Hold down the 'Shift' key.
     * Press and hold the left mouse button.
     * Drag the mouse over the area containing the Japanese text.
5. Popup Window:
   * A popup window will appear with the Japanese text on the first line and the English translation on the second line. Close the popup by clicking the 'X' button.
