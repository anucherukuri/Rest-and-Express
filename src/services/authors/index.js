// ************************************* authorS ENDPOINTS ************************************************

import express from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import uniqid from 'uniqid';

//  HOW TO GET authors.json PATH ON DISK --> /Users/anusharao/Strive School/Modules/Module 5 - Mastering BackEnd Development/Day 2 - Rest & Express/My Homework/Rest-and-Express/src/services/authors/authors.json

// 1. Starting from current file's path --> /Users/anusharao/Strive School/Modules/Module 5 - Mastering BackEnd Development/Day 2 - Rest & Express/My Homework/Rest-and-Express/src/services/authors/index.js

console.log("CURRENT FILE URL: ",import.meta.url);
const currentFilePath = fileURLToPath(import.meta.url);
console.log("CURRENT FILE PATH: ", currentFilePath);

// 2. From currentFilePath, we can get the parent's folder path 
// -> /Users/anusharao/Strive School/Modules/Module 5 - Mastering BackEnd Development/Day 2 - Rest & Express/My Homework/Rest-and-Express/src/services/authors

const parentFolderPath = dirname(currentFilePath);
console.log("PARENT FOLDER PATH: ", parentFolderPath);

// 3. Concatenate parentFolderPath with the name of the file 
// --> /Users/anusharao/Strive School/Modules/Module 5 - Mastering BackEnd Development/Day 2 - Rest & Express/My Homework/Rest-and-Express/src/services/authors/authors.json
// NOTE: Normally you would concatenate strings with "+", please don't do that when dealing with paths --> use JOIN instead

const authorsJSONPath = join(parentFolderPath, "authors.json");
console.log("AUTHORS JSON PATH: ", authorsJSONPath);

const authorsRouter = express.Router();  // all the endpoints attached to the router will have http://localhost:3001/authors as PREFIX

// ***********************----------------------- authorS CRUD -----------------*****************************************************

//******************** CREATE --> POST http://localhost:3001/authors/ (+ body) ******************************

    authorsRouter.post("/", ( request, response ) => {
    // 1. Read request body obtaining new author's data
    console.log("BODY: ",request.body); // DO NOT FORGET server.use(express.json()) in server.js

    // 2. Add some server generated informations (unique id, creation Date, ...)
    const newAuthor = { ...request.body, createdAt: new Date, id: uniqid()}    // uniqid is a 3rd party module that generates unique identifiers
    console.log(newAuthor);

    // 3. Read authors.json --> obtaining an array
    const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath))

    // 4. Add a new author to the array
    authorsArray.push(newAuthor);

    // 5. Write the array back to authors.json file
    fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray))   // we cannot pass an array to this function, but we can pass the stringified version of it

    // 6. Send a proper response back
    response.status(201).send({ id: newAuthor.id })
})

//**************** READ --> GET http://localhost:3001/authors/ (+ optional query parameters) ****************

authorsRouter.get("/", (request, response) => {
    // 1. Read the content of authors.json file
    const fileContent = fs.readFileSync(authorsJSONPath) // You obtain a BUFFER object, which is MACHINE READABLE ONLY
    console.log("FILE CONTENT: ", JSON.parse(fileContent))
  
    // 2. Get back an array from the file
    const authorsArray = JSON.parse(fileContent) // JSON.parse() converts BUFFER into a real ARRAY
  
    // 3. Send back the array as a response
    response.send(authorsArray)
  })

//****************** READ (single author) --> GET http://localhost:3001/authors/:authorId ****************

authorsRouter.get("/:authorId", (request, response) => {
    console.log("REQ PARAMS: ", request.params.authorId)
  
    // 1. Read the file --> obtaining an array
    const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath))
  
    // 2. Find the specific author by id in the array
    const foundAuthor = authorsArray.find(author => author.id === request.params.authorId)
  
    // 3. Send a proper response
    response.send(foundAuthor)
  })

//************ UPDATE (single author) --> PUT http://localhost:3001/authors/:authorId (+ body) *************
    authorsRouter.put("/:authorId", (request, response) => {
    // 1. Read the content of the file --> obtaining an array of authors
    const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath))
  
    // 2. Modify specified author into the array by merging previous properties and new properties coming from req.body
    const index = authorsArray.findIndex(author => author.id === request.params.authorId)
    const oldAuthor = authorsArray[index]
    const updatedAuthor = { ...oldAuthor, ...request.body, updatedAt: new Date() }
  
    authorsArray[index] = updatedAuthor
  
    // 3. Save file back with the updated list of authors
    fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray))
  
    // 4. Send back a proper response
    response.send(updatedAuthor)
  })

//**************** 5. DELETE (single author) --> DELETE http://localhost:3001/authors/:authorId ***********
    authorsRouter.delete("/:authorId", (request, response) => {

    // 1. Read the file --> obtaining an array of authors
    const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath))
  
    // 2. Filter out the specified author from the array, obtaining an array of just the remaining authors
    const remainingAuthors = authorsArray.filter(author => author.id !== request.params.authorId) // ! = =
  
    // 3. Save the remaining authors back to authors.json file
    fs.writeFileSync(authorsJSONPath, JSON.stringify(remainingAuthors))
  
    // 4. Send a proper response
    response.status(204).send()
  })
  
  export default authorsRouter