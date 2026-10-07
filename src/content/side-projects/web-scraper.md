---
title: "Python Webscraper"
caption: "Collects, tracks and displays my climbing gym’s capacity, automated with GitHub Actions."
date: "November 2024"
order: 5
image: /assets/side/ki_webfetch.webp
alt: "Climbing gym capacity chart"
links:
  - { title: "GitHub", url: "https://github.com/liamjosephnolan/ki_webfetch" }
  - { title: "Live data", url: "https://liamjosephnolan.com/epic" }
---

My local climbing gym displays its current capacity in real time on its website. I built a web scraper in Python that parses the page and stores the current capacity in a CSV file. I then automated this script with GitHub Actions to run every 10 minutes.

I also created a Flask app in Python that parses this CSV file, averages the data for each day of the week and returns a JSON export. I Dockerized this codebase and deployed it on Render as an API endpoint, then wrote an HTML page to plot and display the data.

This project taught me a ton about CI/CD deployment and Docker while also telling me the best time to go climbing. The full codebase is on my [GitHub](https://github.com/liamjosephnolan/ki_webfetch), and the data is plotted on my website [here](https://liamjosephnolan.com/epic) in all its 90s-style HTML glory.
