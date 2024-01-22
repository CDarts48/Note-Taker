// Import Express
const express = require("express");
const fs = require("fs");
const path = require("path");

// Import Express' uniqid to generate unique id's
var uniqid = require("uniqid");

// Create an instance of express
const app = express();
const PORT = process.env.PORT || 3001;

// Express Middleware allowing to add arrays and json to url
app.use(express.urlencoded({ extended: true }));
// Express MiddleWare allowing for json use
app.use(express.json());

// Express middleware that allows for serving up static files
app.use(express.static("public"));

// ROUT GET notes.html in the public folder
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "./public/notes.html"))
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

// When a GET request is made to "/api/notes", this function responds by sending the file located at "./db/db.json" in your project directory. This file is sent as a response to the client who made the request.
app.get("/api/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "./db/db.json"), (e) => {
    if (e) throw e;
  });
});

// Create new notes
app.post("/api/notes", (req, res) => {
  // use object send in post request to form new note
  var note = req.body;

  // utilize uniqid package to create unique ID
  note.id = uniqid();

  // read db.json file, extract data into array, then re-write file w/ new note
  fs.readFile(path.join(__dirname, "./db/db.json"), (e, data) => {
    if (e) throw e;

    // parse JSON data to create array
    var currentFile = JSON.parse(data);

    // push new note into that array
    currentFile.push(note);

    // overwrite file w/ new JSON
    fs.writeFile(
      path.join(__dirname, "./db/db.json"),
      JSON.stringify(currentFile),
      (e) => {
        if (e) throw e;
        console.log(`File saved: added note ID ${note.id}`);
      }
    );
  });

  res.sendFile(path.join(__dirname, "./db/db.json"));
});

// Set route for deleting notes
app.delete("/api/notes/:id", (req, res) => {
  // pull data from db.json file
  fs.readFile(path.join(__dirname, "./db/db.json"), (e, data) => {
    if (e) throw e;

    // Parse to create array
    var notes = JSON.parse(data);
    // The Array.prototype.map method is used to create a new array that contains the ids of all the notes. The map method calls the provided function (note) => note.id for each note in the notes array and constructs a new array from the results.
    // The Array.prototype.indexOf method is then used to find the index of req.params.id in the array of ids. req.params.id is the id of the note you're looking for, and indexOf returns the first index at which a given element can be found in the array, or -1 if it is not present.
    var noteIndex = notes.map((note) => note.id).indexOf(req.params.id);

    // will remove the element at noteIndex from the notes array. If noteIndex is -1 (which means the element was not found in the array), splice() will not remove anything.
    notes.splice(noteIndex, 1);

    // overwrite file w/ new JSON created in the noteIndex
    fs.writeFile(
      path.join(__dirname, "./db/db.json"),
      JSON.stringify(notes),
      (e) => {
        if (e) throw e;
        console.log(`File updated: deleted note ID ${req.params.id}`);
      }
    );
  });
  // Respond with the newly updated json file
  res.sendFile(path.join(__dirname, "./db/db.json"));
});

// Wildcard, if user requests something weird send to home page/index.html
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "./public/index.html"))
);

// Starts the server to begin listening
app.listen(PORT, () => console.log(`App listening on PORT ${PORT}`));
