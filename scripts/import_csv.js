
function selectedFileChanged(self, dataLoadedFn) { // when the state of the HTML input changes (a file gets selected), this function will trigger
    if (self.files.length === 0) { // This statement will be true when the user cancels out of the upload dialog.
        console.log('No file selected.'); // Log to the console that the user has selected no file.
        return; // Exit the function, no need to do anything
    }

    // create the file object

    var file = self.files[0]; // this variable will contain the file object, with this.files[0] = document.getElementById('input').files[0]

    // printing CSV to the console

    const reader = new FileReader();
    reader.onload = function fileReadCompleted() { // when the reader is done, the content is in reader.result.
        console.log("CSV input:", reader); // print the CSV input in the console
    };
    reader.readAsText(file); // we will tell reader to interpret the file as text, so reader.result will be text also

    // parsing the CSV into JSON using Papa Parse
    var config = { // we will define the config that Papa Parse is going to use
        delimiter: "", // auto-detect
        newline: "", // auto-detect
        quoteChar: '"',
        escapeChar: '"',
        header: true,
        transformHeader: undefined,
        dynamicTyping: false,
        preview: 0,
        encoding: "",
        worker: false,
        comments: false,
        step: undefined,
        complete: undefined,
        error: undefined,
        download: false,
        downloadRequestHeaders: undefined,
        downloadRequestBody: undefined,
        skipEmptyLines: false,
        chunk: undefined,
        chunkSize: undefined,
        fastMode: undefined,
        beforeFirstChunk: undefined,
        withCredentials: undefined,
        transform: undefined,
        delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
    };

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => dataLoadedFn(results)
    });
}


function initRealData(results) {
    // Initializing the real data          
    var maildata = results.data;
    // Convert .date from string to Date
    for (var i = 0; i < maildata.length; i++) {
        maildata[i].date = new Date(maildata[i].date);
        maildata[i].sentiment = parseFloat(maildata[i].sentiment);
    }
    return maildata;
}


// Initialize test data - for initial tests, not used in the final version 
/*
function initTestData() {
  
    var maildata = [
        {
            "date": new Date('2000-08-13'),
            "fromId": 96,
            "fromEmail": "matthew.lenhart@enron.com",
            "fromJobtitle": "Employee",
            "toId": 77,
            "toEmail": "eric.bass@enron.com",
            "toJobtitle": "Trader",
            "messageType": "CC",
            "sentiment": 0.9
        },
        {
            "date": new Date('2001-11-22'),
            "fromId": 64,
            "fromEmail": "danny.mccarty@enron.com",
            "fromJobtitle": "Vice President",
            "toId": 121,
            "toEmail": "rod.hayslett@enron.com",
            "toJobtitle": "Vice President",
            "messageType": "TO",
            "sentiment": 0.5
        },
        {
            "date": new Date('2000-08-12'),
            "fromId": 64,
            "fromEmail": "danny.mccarty@enron.com",
            "fromJobtitle": "Vice President",
            "toId": 121,
            "toEmail": "rod.hayslett@enron.com",
            "toJobtitle": "Vice President",
            "messageType": "TO",
            "sentiment": 0.5
        }
    ];
          
    var empCnt = 150;
    for (var i = 0; i < empCnt; i++) {
        var jobFrom = "Employee";
        var jobTo = "Employee";
        var res = i % 3;
        if (res == 0) {
            jobFrom = "Trader"
        } else if (res == 1) {
            jobFrom = "Manager"
        }

        res = (empCnt - i - 1) % 3;
        if (res == 0) {
            jobTo = "Trader"
        } else if (res == 1) {
            jobTo = "Manager"
        }

        var m = {
            "date": new Date('2000-08-1' + i % 3),
            "fromId": i,
            "fromEmail": "mail" + i + "@enron.com",
            "fromJobtitle": jobFrom,
            "toId": i + 10,
            "toEmail": "mail" + (empCnt - i - 1) + "@enron.com",
            "toJobtitle": jobTo,
            "messageType": "CC",
            "sentiment": -1 + (i%7)*0.3
        }
        maildata.push(m)

        m = {
            "date": new Date('2000-08-1' + i % 3),
            "fromId": 64,
            "fromEmail": "danny.mccarty@enron.com",
            "fromJobtitle": "Vice President",
            "toId": i,
            "toEmail": "mail" + i + "@enron.com",
            "toJobtitle": jobFrom,
            "messageType": "CC",
            "sentiment": -1 + (i%7)*0.3
        }
        maildata.push(m)
    }    

    //  Debug
    for (var i = 0; i < maildata.length; i++) {
        console.log("maildata[" + i + "]=" + maildata[i].fromJobtitle + ", " + maildata[i].fromEmail + ", " + maildata[i].toJobtitle + ", " + maildata[i].toEmail)
    }

    return maildata;
}            
*/