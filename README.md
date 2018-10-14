
> This project was started from [reactGo](https://github.com/reactGo/reactGo) boilerplate

# Tulips Are Better


## About
Tulips Are Better is a responsive website where people can post and manage their own stories and books. It was created with the aim of making its use easy and intuitive and having a clean design focused on a user's reading experience. I used my own experience both as a reader and creator in its making, because -- although there are similar sites across the net -- I've often found them lacking in certain aspects.


I've been working on it for about 2-3 years in my free time, starting as a beginner and learning web programming on the way. There are parts of the site where the code hasn't been updated/reworked for some time and may include badly written code.

Demo site: **[https://tulips-218223.appspot.com](https://tulips-218223.appspot.com)**


## Currently working on (see todos for a list of future plans)

Restructuring & rewriting React components and the reducers

## Notes & issues:

- I've updated most of the dependencies from reactGo to be up-to-date, but not all.
    - The site is using webpack 4 (updated from 2), but I didn't have the time to test its performance yet, and without much experience with it I'm not sure how good its configuration is.
    - It's not using the hydrate method
- The user system will only use google, facebook, etc. for login/register (with passport), but it's currently not working.
- I've been using nested css selectors in .css files, but I plan on getting rid of them in the future.
- There are not many comments in the files, which I also plan on changing in the future
- I've removed the testing from reactGo not seeing its usefulness at the start of working on this site, but I definitely want to reimplement them
- Several functions and features have not yet been implemented (see under Features)
- Although most of the site is responsive (currently optimized for mobile (360-525px), tablet (525-750px) and desktop (>750px)), there are a few places that aren't, most importantly the navigation at right side of the screen which is only working on the desktop size.
- Currently only optimized for Chrome


## What's this project using?

This site uses Webpack 4, React, Redux, Node.js and ArangoDB (I've started with MongoDB, but kept encountering issues and switched to ArangoDB, which I gladly recommend).


## Roadmap

1. Restructuring & rewriting React components and the reducers
2. Reintroducing passport login/register
3. Creating settings page
4. Finishing Conversations, Lists Page and "add to list" button on the Fiction Page
5. Adding the option to edit works
6. Adding the option to reorder fictions and chapters
7. Rewrite the css files
8. Adding the option to donate or subscribe for a fiction

Upgrade to the latest redux version
Reintroduce unit testing


## Site Features:

- Working:
    - Home page (except slider)
    - Fiction page (except add to list, donate and subscribe buttons; also there is no option for monetizing your work yet)
    - Article page
    - Profile page (except the navigation below the friends list)
    - Submit page
      - Posting a book
      - Posting a volume
      - Posting a chapter
    - Reviews (posting, editing, rating included)
    - Comments
      - Replies (currently only showing at a single depth, though the database saves the complete hierarchy)
    - Conversations (you can't create conversations or post messages, so it's mostly an empty page)
    - Lists (you can't create a list or add items to it, so it's mostly an empty page)
    - List (used for universe, series page or listing an author's works)
    - Author Page (lists logged in user's works with brief statistics)
    - Fiction Dashboard (gives detailed summary of selected book with ratings and statistics included)
    - Notifications Page (only works for fiction and chapter updates)

- In plan (in addition to the ones listed above):
    - Login/Register Page
    - About Page
    - Submit Page
      - Posting a universe
      - Posting a series
    - Settings Page
    - Browse Page (will be using List Page, but with the ability to filter and sort fictions)