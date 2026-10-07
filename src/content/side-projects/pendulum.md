---
title: "Futura Pendulum"
caption: "Modelling and LQR control of a Futura-style rotary pendulum in Simscape."
date: "March 2025"
order: 2
image: /assets/side/system.webp
alt: "Rotary pendulum model"
links:
  - { title: "GitHub", url: "https://github.com/liamjosephnolan/multbody_proj/tree/main/Task_III_solution" }
---

A Futura pendulum is an adaptation of the classic pendulum-on-a-cart problem. However, rather than having the revolute joint of the pendulum connected to a linear cart, the revolute joint is connected to a second revolute joint. This formulation allows for theoretically infinite angular rotation of the base joint, enabling unique motion possibilities.

The pendulum was modeled using Simscape Multibody, and a Linear Quadratic Regulator (LQR) controller was designed in Simulink to stabilize the pendulum in its upright position. MATLAB's linearization toolbox was used to linearize the system around its upright position, and the gain matrix was calculated from this linearization.

![Simulink model of the Futura pendulum system](../../assets/side/model.webp)

*Figure 1: Simulink model of the Futura pendulum system.*

Overall, the system proved to be quite stable, responding well to both initial displacement and further perturbations. This project was an excellent learning experience in modeling and controlling unstable systems using Simscape Multibody.

![System dynamics response of the Futura pendulum](../../assets/side/response.webp)

*Figure 2: System dynamics response of the Futura pendulum.*
