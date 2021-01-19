# Bloggy Api

## Technologies

### Frontend:

- Reactjs
- (Focus on Hooks)
  See https://github.com/Kunstix/Bloggy for the frontend code

### Backend:

- Nodejs
- Express
- MongoDB

## Concept

This project was used to create a full blown multi-user blogging platform. The focus was to establish a solid understanding of REACT.js and escpecially NEXT.js.
This approach was chosen because a solid SPA would lack the benefits of SEO.
But a SSR would probably not be as performant as an CSR.
So NEXT.js was chosen because it combines the advantages of both worlds.
Being able to render everything SSR for a first request but acting as a SPA with CSR in any additiona requests of the client sounded very interesting.
Nodejs was chosen to check how Javascript compares to other backend languages. ;)

## Features:

### General

- SSR with NEXTjs
- CSR/SPA with Reactjs
- SEO
- API with Nodejs
- Google Analytics Integration
- Sending Emails with Sendgrid
- Deployed to Heroku

### Auth

- Multiuser
- JWT based Authentification
- Login & Registering
- Forgot password & Reset password
- Account activation by email
- OAuth for Google
- Role based

### Users

- Rolemanagement: Admin, User
- Profile Page (Contact form, listing user blogs, etc.)
- Editing by private Dashboard

### Blogging

- Creating, searching, editing, deleting blogs
- Blogs contain of an image and text:
- Blog Search by words
- Blog Search by tags
- Blog Search by categories
- Pagination by "load more" function
- Image Upload
- Tags & Categories
- Contact Form for author
- DISQUS Commenting
- Related Blogs

## Sneak peaks

![alt text](walkthrough.gif?raw=true)

## Demo

https://bloggy-bloggy.herokuapp.com/blogs#
