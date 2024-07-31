$(document).ready(function() {
	
	// Initialize elevators
    let elevators = [
        { id: 1, floor: 0, busy: false, moving: false, element: $('[data-elevator=1]'), timeout: null },
        { id: 2, floor: 0, busy: false, moving: false, element: $('[data-elevator=2]'), timeout: null },
        { id: 3, floor: 0, busy: false, moving: false, element: $('[data-elevator=3]'), timeout: null },
        { id: 4, floor: 0, busy: false, moving: false, element: $('[data-elevator=4]'), timeout: null },
        { id: 5, floor: 0, busy: false, moving: false, element: $('[data-elevator=5]'), timeout: null }
    ];
	
	// Initialize queue for elevator calls
    let queue = [];
	
	// Get sound elements
    const callSound = document.getElementById('call-sound');
    const arriveSound = document.getElementById('arrive-sound');
	
	// Function to find the closest available elevator

    function findClosestElevator(floor) {
        let closest = null;
        let minDistance = Infinity;

        elevators.forEach(function(elevator) {
            if (!elevator.busy || elevator.moving) {
                let distance = Math.abs(elevator.floor - floor);
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = elevator;
                }
            }
        });

        return closest;
    }
	
	
	// Function to move the elevator to the requested floor
    function moveElevator(elevator, floor) {
        let currentFloor = elevator.floor;
        let distance = Math.abs(currentFloor - floor);
        let timeToMove = distance * 1000; // 1 second per floor

        elevator.busy = true;
        elevator.moving = true;
        elevator.element.addClass('moving').css('transition', 'top ' + timeToMove + 'ms linear');
        elevator.element.css('top', (550 - floor * 61.2) + 'px'); // 61.2px per floor, starting from ground floor at 561.2px

        let startTime = new Date();

        elevator.timeout = setTimeout(function() {
            if (!elevator.moving) return; // Stop if the elevator was requested to stop

            let endTime = new Date();
            let timeDiff = Math.abs(endTime - startTime) / 1000; // in seconds
            $('[data-floor=' + floor + '] .timer').text(timeDiff.toFixed(2) + ' sec');

            elevator.floor = floor;
            elevator.busy = false;
            elevator.moving = false;
            elevator.element.removeClass('moving').addClass('arrived');

            // Play arrive sound
            arriveSound.play();

            // Correctly target the call button for the current floor
            $('[data-floor=' + floor + '].call-button.waiting').removeClass('waiting').addClass('arrived').text('Arrived');

            setTimeout(function() {
                elevator.element.removeClass('arrived');
                $('[data-floor=' + floor + '].call-button.arrived').removeClass('arrived').text('Call');
                $('[data-floor=' + floor + '] .timer').text('');
                if (queue.length > 0) {
                    let nextCall = queue.shift();
                    handleCall(nextCall.floor);
                }
            }, 2000);
        }, timeToMove);
    }
	
	// Function to stop the elevator at the nearest floor
    function stopElevator(elevator) {
        elevator.moving = false;
        clearTimeout(elevator.timeout); // Clear the timeout to stop the elevator
        let currentTop = parseFloat(elevator.element.css('top'));
        let nearestFloor = Math.round((550 - currentTop) / 61.2); // Calculate the nearest floor
        elevator.element.css('top', (550 - nearestFloor * 61.2) + 'px');
        elevator.floor = nearestFloor;
        elevator.busy = false;

        // Play arrive sound
        arriveSound.play();

        // Correctly target the call button for the current floor
        $('[data-floor=' + nearestFloor + '].call-button.waiting').removeClass('waiting').addClass('arrived').text('Arrived');

        setTimeout(function() {
            elevator.element.removeClass('arrived');
            $('[data-floor=' + nearestFloor + '].call-button.arrived').removeClass('arrived').text('Call');
            $('[data-floor=' + nearestFloor + '] .timer').text('');
            if (queue.length > 0) {
                let nextCall = queue.shift();
                handleCall(nextCall.floor);
            }
        }, 2000);
    }
	
	// Function to handle an elevator call
    function handleCall(floor) {
        let elevator = findClosestElevator(floor);
        if (elevator) {
            moveElevator(elevator, floor);
        } else {
            queue.push({ floor: floor });
        }
    }
	
	// Event listener for call buttons
    $('.call-button').click(function() {
        let floor = $(this).data('floor');
        let elevator = findClosestElevator(floor);
        
        if (elevator && elevator.moving) {
			//alert("here");
			if ($(this).hasClass('waiting')) {
				$(this).removeClass('waiting').text('Call');
			}
            stopElevator(elevator);
        } else {
            if (!$(this).hasClass('waiting')) {
				//alert("here1");
                $(this).addClass('waiting').text('Waiting');
                
                // Play call sound
                callSound.play();
                
                handleCall(floor);
            }
        }
    });
});
