# Lift Simulator

## Overview

The Lift Simulator is a web-based application that simulates the operation of multiple lifts in a building. It allows users to specify the number of floors and lifts, and then interact with the lifts by calling them to different floors.

Access live site : https://jc-lift-sim.netlify.app/

## Features

1. Customizable building setup (number of floors and lifts)
2. Real-time lift movement simulation
3. Lift door opening and closing animations
4. Intelligent lift selection based on proximity
5. User-friendly interface for calling lifts

## How It Works

### Setup

1. The user starts on a landing page where they can input the number of floors (1-10) and lifts (1-10) for the simulation.
2. Upon clicking the "Start" button, the simulation page is displayed with the specified number of floors and lifts.

### Lift Mechanics

1. Each lift is represented by an object with properties such as current floor, direction, availability, and movement status.
2. Lifts are initially positioned on the ground floor (floor 1).

### User Interaction

1. Each floor (except the top floor) has an "Up" button, and each floor (except the ground floor) has a "Down" button.
2. When a user clicks a button, they are prompted to enter their destination floor.

### Lift Selection and Movement

1. The system selects the closest available lift to respond to the user's request.
2. If no lifts are available, the user is notified to wait.
3. The selected lift becomes unavailable and moves to the user's current floor (if not already there).
4. The lift's doors open, and a message is displayed indicating that it's picking up the user.
5. After a short delay, the doors close, and the lift moves to the destination floor.
6. Upon reaching the destination, the doors open again, and a message indicates that the user is being dropped off.
7. Finally, the lift becomes available again for new requests.

## How to Run

1. Clone the repository to your local machine.
2. Open the `index.html` file in a web browser.
3. Enter the desired number of floors and lifts (1-10 for each).
4. Click "Start" to begin the simulation.
5. Use the "Up" and "Down" buttons on each floor to call lifts and enter your destination floor when prompted.

## Conclusion

This Lift Simulator provides a basic yet functional representation of lift operations in a multi-story building. It demonstrates concepts of state management, user interaction, and animation in web development.
