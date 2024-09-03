const floors = document.querySelector('#floors');
const lifts = document.querySelector('#lifts');
const startButton = document.querySelector('#start-simulation');
const floorContainer = document.querySelector('.floor-container');
const simulationPage = document.querySelector('#simulation-page');
const landingPage = document.querySelector('#landing-page');

const maxFloors = 10;
const maxLifts = 10;
const minFloors = 1;
const minLifts = 1;
let positionPerMove = 106; // will translate y axis by 105px

let gameFloors = 0;

const liftStructure = {
  id: 0,
  currentFloorNumber: 0,
  direction: 'idle', // up, down, idle
  isMoving: false,
  isDoorOpen: false,
  isAvailable: true,
  currentPosition: 0
};

const floorStructure = {
  id: 0,
  floorNumber: 0,
  liftsOnFloor: []
};

const liftsData = [];
const floorsData = [];

const handleStartSimulation = (e) => {
  e.preventDefault();

  const floorsVal = floors.value;
  const liftsVal = lifts.value;

  // validate the input
  if (floorsVal < minFloors || floorsVal > maxFloors) {
    alert('Please enter a valid number of floors');
    return;
  }

  if (liftsVal < minLifts || liftsVal > maxLifts) {
    alert('Please enter a valid number of lifts');
    return;
  }

  // assign game floor
  gameFloors = floorsVal;

  // start the simulation
  console.log('Starting the lift simulation');

  // show the simulation page and hide the landing page
  simulationPage.style.display = 'block';
  landingPage.style.display = 'none';

  handleCreateLiftAndFloor({ lifts: liftsVal, floors: floorsVal });
};

startButton.addEventListener('click', handleStartSimulation);

const handleCreateLiftAndFloor = ({ lifts, floors }) => {
  // update position per move via floor number
  if (floors > 6) {
    positionPerMove = 108;
  }

  for (let i = 0; i < lifts; i++) {
    const lift = {
      ...liftStructure,
      id: i + 1,
      currentFloorNumber: 1
    };

    liftsData.push(lift);
  }

  for (let i = 0; i < floors; i++) {
    // floor number should be from top to bottom e.g 5, 4, 3, 2, 1
    const floorNumber = floors - i;
    const floor = {
      id: i + 1,
      floorNumber,
      liftsOnFloor: []
    };

    floorsData.push(floor);
  }

  let html = '';

  for (let i = 0; i < floorsData.length; i++) {
    const isLastFloor = i === floorsData.length - 1;
    const isFirstFloor = i === 0;
    const currentFloor = floorsData[i];
    const currentFloorNumber = currentFloor.floorNumber;

    const upBtn = `<button class="up-btn" onclick="handleMoveLift(${currentFloorNumber}, 'up')">Up</button>`;
    const downBtn = `<button class="down-btn" onclick="handleMoveLift(${currentFloorNumber}, 'down')">Down</button>`;

    if (isFirstFloor) {
      html += `<div class="floor">
          <div class="control-btns">
            ${downBtn}
          </div>

          <div class="floor-ground"></div>
        </div>`;
    } else if (isLastFloor) {
      html += `
       <div class="floor">
          <div class="control-btns">
            ${upBtn}
          </div>

          <div class="floor-ground">
            ${liftsData.map((lift) => {
              return `<div class="lift" data-lift-id="${lift.id}"></div>`;
            })}
          </div>
        </div>`;
    } else {
      html += `<div class="floor">
          <div class="control-btns">
            ${upBtn}
            ${downBtn}
          </div>

          <div class="floor-ground"></div>
        </div>`;
    }

    floorContainer.innerHTML = html;
  }
};

const handleMoveLift = (currentFloorNumber, direction) => {
  console.log('currentFloorNumber', currentFloorNumber);
  console.log('direction', direction);

  const floorToMove = parseInt(
    prompt('Enter the floor number to move the lift to')
  );

  // ensure user don't move to the same floor
  if (currentFloorNumber === floorToMove) {
    alert('You are already on this floor');
    return;
  }

  // check if direction is down and is above user current floor
  if (direction === 'down' && currentFloorNumber < floorToMove) {
    alert('If you need to move to the top floor, please press the up button');
    return;
  }

  // ensure user cannot move to a floor that is not in the building
  if (floorToMove < 1 || floorToMove > gameFloors) {
    alert('Please enter a valid floor number');
    return;
  }

  // get closest and available lift
  const availableLifts = liftsData.filter((lift) => lift.isAvailable);
  console.log('availableLifts', availableLifts);

  if (availableLifts.length === 0) {
    alert('No lifts are currently available. Please wait.');
    return;
  }

  const closestLift = availableLifts.reduce((closest, lift) => {
    return Math.abs(lift.currentFloorNumber - currentFloorNumber) <
      Math.abs(closest.currentFloorNumber - currentFloorNumber)
      ? lift
      : closest;
  });
  console.log('closestLift', closestLift);

  // Mark the lift as unavailable immediately
  closestLift.isAvailable = false;

  let floorsToIterate = [];
  const userFloor = currentFloorNumber;
  const destinationFloor = floorToMove;

  if (closestLift.currentFloorNumber !== userFloor) {
    floorsToIterate.push(userFloor);
  }
  floorsToIterate.push(destinationFloor);

  console.log('floorsToIterate', floorsToIterate);

  moveLiftToFloors(closestLift, floorsToIterate, direction);
};

const moveLiftToFloors = (lift, floors) => {
  let currentFloor = lift.currentFloorNumber;

  const showMessage = (message) => {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    setTimeout(() => messageElement.remove(), 2000);
  };

  const liftElement = document.querySelector(
    `.lift[data-lift-id="${lift.id}"]`
  );

  const openDoors = () => {
    liftElement.classList.add('door-open');
    lift.isDoorOpen = true;
  };

  const closeDoors = () => {
    liftElement.classList.remove('door-open');
    lift.isDoorOpen = false;
  };

  const moveLiftToNextFloor = (index) => {
    if (index >= floors.length) {
      lift.isMoving = false;
      lift.direction = 'idle';
      lift.isAvailable = true; // Make the lift available again
      return;
    }

    const nextFloor = floors[index];

    const moveToFloor = () => {
      const floorDiff = nextFloor - currentFloor;
      const moveDirection = floorDiff > 0 ? 'up' : 'down';
      const totalTranslate = getTotalTranslateViaFloorAndDirection(nextFloor);

      lift.isMoving = true;
      lift.direction = moveDirection;
      liftElement.style.transition = 'transform 2s ease';
      liftElement.style.transform = `translateY(${totalTranslate}px)`;

      setTimeout(() => {
        currentFloor = nextFloor;
        lift.currentFloorNumber = nextFloor;
        lift.currentPosition = totalTranslate;
        lift.isMoving = false;

        openDoors();
        if (index === 0 && floors.length > 1) {
          showMessage(
            `Lift ${lift.id} picking up user at floor ${currentFloor}`
          );
        } else if (index === floors.length - 1) {
          showMessage(
            `Lift ${lift.id} dropping off user at floor ${currentFloor}`
          );
        }

        setTimeout(() => {
          closeDoors();
          setTimeout(() => {
            moveLiftToNextFloor(index + 1);
          }, 1000);
        }, 2000);
      }, 2000);
    };

    if (currentFloor === nextFloor) {
      openDoors();
      showMessage(`Lift ${lift.id} at floor ${currentFloor}`);
      setTimeout(() => {
        closeDoors();
        setTimeout(() => {
          moveLiftToNextFloor(index + 1);
        }, 1000);
      }, 2000);
    } else {
      if (lift.isDoorOpen) {
        closeDoors();
        setTimeout(moveToFloor, 1000);
      } else {
        moveToFloor();
      }
    }
  };

  moveLiftToNextFloor(0);
};

const getTotalTranslateViaFloorAndDirection = (destinationFloor) => {
  // Calculate the total translation based on the destination floor
  // Remember: Ground floor (1) should have 0 translation
  return -(destinationFloor - 1) * positionPerMove;
};
