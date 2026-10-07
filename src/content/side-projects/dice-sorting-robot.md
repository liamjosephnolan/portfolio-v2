---
title: "Dice Sorting Robot"
caption: "ABB robot arm and Cognex vision that pick, sort and place dice, programmed in RAPID."
date: "April 2024"
order: 7
image: /assets/side/dicesort.webp
alt: "ABB robot arm above a dice tray"
links:
  - { title: "GitHub", url: "https://github.com/liamjosephnolan/DiceRobot" }
  - { title: "Video", url: "https://www.youtube.com/watch?v=Jz5EcAL-HFM" }
---

This project used an ABB robot arm and a Cognex camera to track, pick up and sort dice into a tray. The robot's move instructions were all programmed in RAPID, with the vision processing handled by a custom program running on the Cognex camera. The robot would pick up a die from a tray, drop it onto the conveyor and then determine where to place it. It would repeat indefinitely or until stopped by the user.

<div class="video-embed video-embed--portrait">
  <iframe src="https://www.youtube-nocookie.com/embed/Jz5EcAL-HFM" title="ABB Dice Sorting Robot" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>
