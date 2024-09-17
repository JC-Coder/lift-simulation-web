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
const movementTransitionPerFloorInSeconds = 2;

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
  liftsOnFloor: [],
  liftCurrentlyProcessing: false
};

const liftsData = [];
const floorsData = [];

const handleStartSimulation = (e) => {
  e.preventDefault();

  const floorsVal = floors.value;
  const liftsVal = lifts.value;

  // validate the input
  if (floorsVal <= minFloors || floorsVal > maxFloors) {
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
      liftsOnFloor: [],
      liftCurrentlyProcessing: false
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

const handleMoveLift = (floorToMove) => {
  // get closest and available lift
  const availableLifts = liftsData.filter((lift) => lift.isAvailable);

  if (availableLifts.length === 0) {
    alert('No lifts are currently available. Please wait.');
    return;
  }

  const closestLift = availableLifts.reduce((closest, lift) => {
    return Math.abs(lift.currentFloorNumber - floorToMove) <
      Math.abs(closest.currentFloorNumber - floorToMove)
      ? lift
      : closest;
  });

  // Mark the lift as unavailable immediately
  // closestLift.isAvailable = false;

  // move lift to floor
  moveLiftToFloor(closestLift, floorToMove);
};

const moveLiftToFloor = (lift, floor) => {
  const floorObject = floorsData.find((f) => f.floorNumber == floor);

  // check if there is an active lift on the floor
  if (floorObject.liftCurrentlyProcessing) {
    return;
  }

  // mark lift as unavailable
  lift.isAvailable = false;

  // mark the floor as processing
  floorObject.liftCurrentlyProcessing = true;

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

  const floorDiff = Math.abs(floor - lift.currentFloorNumber);
  const moveDirection = floor > lift.currentFloorNumber ? 'up' : 'down';
  const totalTranslate = getTotalTranslateViaFloorAndDirection(floor);

  const totalTimeToMove = floorDiff * 2; // 2 seconds per floor

  // Open and close doors at the starting floor
  const isLiftAlreadyOnTheFloor = lift.currentFloorNumber === floor;
  if (isLiftAlreadyOnTheFloor) {
    openDoors();
  }

  setTimeout(
    () => {
      if (isLiftAlreadyOnTheFloor) {
        closeDoors();
      }

      if (lift.currentFloorNumber === floor) {
        setTimeout(() => {
          lift.isAvailable = true;
          floorObject.liftCurrentlyProcessing = false;
        }, 1000);

        return;
      }

      // Start moving after doors close
      setTimeout(() => {
        lift.isMoving = true;
        lift.direction = moveDirection;
        liftElement.style.transition = `transform ${totalTimeToMove}s linear`;
        liftElement.style.transform = `translateY(${totalTranslate}px)`;

        // Open and close doors at the destination floor
        setTimeout(() => {
          lift.isMoving = false;
          lift.currentFloorNumber = floor;
          lift.direction = 'idle';
          openDoors();

          setTimeout(() => {
            closeDoors();

            floorObject.liftCurrentlyProcessing = false;
            setTimeout(() => {
              lift.isAvailable = true;
            }, 1000);
          }, 2000);
        }, totalTimeToMove * 1000);
      }, 1000);
    },
    isLiftAlreadyOnTheFloor ? 2000 : 0
  );
};

const getTotalTranslateViaFloorAndDirection = (destinationFloor) => {
  // Calculate the total translation based on the destination floor
  // Remember: Ground floor (1) should have 0 translation
  return -(destinationFloor - 1) * positionPerMove;
};
