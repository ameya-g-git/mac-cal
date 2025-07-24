# MacCal
A browser extension that generates an .ics (calendar) file using the details on your MyTimetable page!

Accounts for sessional dates, ensuring your calendar only shows dates that class actually occurs! (save for unexpected circumstances like weather, obviously)

**(not affiliated with McMaster University! just made by someone who uses their calendar a lot)**

## Usage
Fortunately, the extension is very simple to use!

1. Sign into [MyTimetable](https://mytimetable.mcmaster.ca]) and select a semester!
2. Customize the name of each calendar event *(the buttons will insert the given detail into the name)*, or just leave it how it is!
3. Choose if you want the room code to be stored in the event's `location` property (i personally like how this looks)!
4. Press "Generate Calendar" and download the `.ics` file once the dialog pops up!
5. Go to your favourite calendar service (Apple Calendar, Google Calendar, etc.) and import the `.ics` file you just downloaded!
   - For Apple Calendar, importing it is as easy as opening the `.ics` file by double clicking it in Finder!
   - For Google Calendar, you need to visit `Settings > Import & Export` and then select the `.ics` file and the calendar you want to import into!
   - Other calendar services will likely follow a similar process to one of these.

## Data
No data is collected or stored by me from your MyTimetable page once you're signed in. 

Information is read from the webpage once you click "Generate Calendar" and is not stored after reading.

## Development / Troubleshooting
Dealing with errors? Hate my code? Want to add another statuatory holiday that you observe? Raise an issue on this GitHub page, or fix it yourself! Here's how to get started.

Node: version>=18.12.0<br>
NPM: version>=8.19.2

Clone the repo locally:
```sh
git clone https://github.com/ameya-g-git/mac-cal
cd mac-cal
```

Install dependencies:
```sh
npm install
```

Run the Webpack watch script to compile on file changes:
```sh
npm run watch
```

And now you're all set to get started! Some information about the file structure:

- `/assets`: Promotional images
- `/build`: The bundled Webpack code
- `/node_modules`: Yaknow
- `/src`: The meat of the extension.
  - `/background`: The background script for the extension. Receives and transmits messages between the content scripts and the popup script.
  - `/content`: Content scripts. Read the webpage and generate the `.ics` file
    - `/date_utils`: A ton of small functions that calculate given statuatory holidays relating to McMaster's sessional dates
  - `/settings`: The JS file that deals with interaction on the popup.
  - `/static`: Static assets, including fonts, images used in the extension, and the popup HTML + CSS. 
