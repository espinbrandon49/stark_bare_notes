const express = require('express')
const path = require('path')
const fs = require('fs')
let notes = require('./db/db.json')
const uuid = require('./helpers/uuid')
const { notDeepStrictEqual } = require('assert')

const PORT = process.env.PORT || 3001

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// access everything in the 'public folder'
app.use(express.static('public'))

// create HTML GET route to return index.html file from public
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, './public/index.html'))
)

// create HTML GET route  return the `notes.html` file
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, './public/notes.html'))
})

// 'GET /api/notes` should read the `db.json` file and return all saved notes as JSON'.
app.get('/api/notes', (req, res) => {
  // send a message to the client 
  //msg 1: notes as a console.log in terminal
  console.log(notes)

  //msg 2: as a json format for the index.js? 
  res.json(notes)

  console.info(`${req.method} request received to get notes`)
})

//POST /api/notes`
//1) should receive a new note DONE
//2) to save on the request body
//3) add it to the `db.json` file, 
//4) and then return the new note to the client.

app.post('/api/notes', (req, res) => {
  //1) log that a post request (new note) was received
  console.info(`${req.method} request received to add a new note`)

  //Destructure assignment for the items in the req.body
  const { title, text } = req.body;

  // If all the parameters are present
  if (title && text) {
    //variable for the new note(object) I am saving
    const newNote = {
      title,
      text,
      id: uuid(),
    }

    //2) save on the request body 
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err)
      } else {
        //convert string into JSON object
        const parsedNotes = JSON.parse(data)

        //3) Add new note to the db.json file
        parsedNotes.push(newNote)
        notes = parsedNotes

        //4) return the new note to the client
        fs.writeFile(
          './db/db.json',
          JSON.stringify(parsedNotes, null, 4),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info('Successfully added a new note!')
        )
      }
    });

    // Update notes list dynamically, How?
    const response = {
      status: 'success',
      body: newNote,
    }

    console.log(response);
    res.json(response);
  } else {
    //not really necessary because the save note icon is shown if text/title is present
    res.json('Error in posting review')
  }
})

//* `DELETE /api/notes/:id` should receive a query parameter that contains the id of a note to delete. To delete a note, you'll need to read all notes from the `db.json` file, remove the note with the given `id` property, and then rewrite the notes to the `db.json` file.

app.delete('/api/notes/:id', async (req, res) => {
  console.log(req.params.id)
  const deleteId = req.params.id
  console.info(`${req.method} request received to delete a note`)
  await notes.map((note, index) => {
    console.log(note.id, index)
    if (deleteId == note.id) {
      notes.splice(index, 1)
    }
  })
  //res.json(notes)
  fs.writeFile('./db/db.json', JSON.stringify(notes), (err) => {
    if (err) throw err;
    res.json(notes)
  })
  // const filteredNotes = notes.filter(note => note.id != deleteId)
  // fs.writeFile('./db/db.json', JSON.stringify(filteredNotes), (err) => {
  //   if (err) throw err;
  //   res.json(notes)
  // })

})

// Binds and listens for connections on PORT 3001
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
)

/**
 * Delete notes
 * Review student (my) comments for accuracy
 */