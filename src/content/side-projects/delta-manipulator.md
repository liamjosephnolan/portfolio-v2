---
title: "Delta Manipulator Simulation"
caption: "Trajectory planning and kinematics of an IGUS delta robot in MATLAB and Simscape."
date: "April 2024"
order: 8
image: /assets/side/delta.webp
alt: "Simscape model of a delta manipulator"
links:
  - { title: "GitHub", url: "https://github.com/liamjosephnolan/Delta-Manipulator" }
---

This project used MATLAB, Simulink and Simscape Multibody to model and simulate an IGUS Delta Manipulator. A desired trajectory path for the end effector was planned using trapezoidal velocity profiles. Inverse kinematics were then used to calculate joint positions based on the desired trajectory, and forward kinematics were used to calculate the new end effector position and update the Simscape model.
