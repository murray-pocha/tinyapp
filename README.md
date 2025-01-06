# TinyApp Project

TinyApp is a fully responsive full-stack web application built with Node.js and Express. This project allows users to create, manage, and share shortened URLs (similar to bit.ly), making it easier to handle long URLs efficiently.

### Final Product

Below are some screenshots showcasing the features of TinyApp:

## Registration-

![Registration Page.](docs/Screenshot%202024-11-26%20222543.png)

## My URLS-

![My URLs.](docs/Screenshot%202024-11-27%20215359.png)

## Create TinyURL

![Create TinyURL.](docs/Screenshot%202024-11-27%20215418.png)

### Project Structure
views/: Contains all the EJS templates for rendering web pages.

helpers.js: Utility functions for handling common operations such as user validation and URL filtering.

express_server.js: The main server file managing routes and application logic.

data/: Stores any mock data or sample JSON files used in the project.



### Features
User Authentication: Secure registration and login system using hashed passwords.

Personalized URLs: Users can create, edit, and delete their own URLs while keeping them private.

URL Management: Simple and intuitive interface to manage and track shortened URLs.

Responsive Design: Compatible with both desktop and mobile devices.

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- methodOveride

## Getting Started
- Clone the repository [git clone <repository_url>
cd tinyapp]
- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Access the app, open your browser and navigate to [http://localhost:8080/]
- Test the app [register as a new user, create, edit, and manage your shortened URLs]



