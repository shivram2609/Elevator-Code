$(document).ready(function() {
    let elevators = [
        { id: 1, floor: 0, busy: false, element: $('[data-elevator=1]') },
        { id: 2, floor: 0, busy: false, element: $('[data-elevator=2]') },
        { id: 3, floor: 0, busy: false, element: $('[data-elevator=3]') },
        { id: 4, floor: 0, busy: false, element: $('[data-elevator=4]') },
        { id: 5, floor: 0, busy: false, element: $('[data-elevator=5]') }
    ];

    let queue = [];

    const callSound = document.getElementById('call-sound');
    const arriveSound = document.getElementById('arrive-sound');

    function findClosestElevator(floor) {
        let closest = null;
        let minDistance = Infinity;

        elevators.forEach(function(elevator) {
            if (!elevator.busy) {
                let distance = Math.abs(elevator.floor - floor);
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = elevator;
                }
            }
        });

        return closest;
    }

    function moveElevator(elevator, floor) {
        let currentFloor = elevator.floor;
        let distance = Math.abs(currentFloor - floor);
        let timeToMove = distance * 1000; // 1 second per floor

        elevator.busy = true;
        elevator.element.addClass('moving').css('transition', 'top ' + timeToMove + 'ms linear');
        elevator.element.css('top', (550 - floor * 61.2) + 'px'); // 61.2px per floor, starting from ground floor at 550px

        let startTime = new Date();

        setTimeout(function() {
            let endTime = new Date();
            let timeDiff = Math.abs(endTime - startTime) / 1000; // in seconds
            $('[data-floor=' + floor + '] .timer').text(timeDiff.toFixed(2) + ' sec');

            elevator.floor = floor;
            elevator.busy = false;
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

    function handleCall(floor) {
        let elevator = findClosestElevator(floor);
        if (elevator) {
            moveElevator(elevator, floor);
        } else {
            queue.push({ floor: floor });
        }
    }

    $('.call-button').click(function() {
        let floor = $(this).data('floor');
        if (!$(this).hasClass('waiting')) {
            $(this).addClass('waiting').text('Waiting');
            
            // Play call sound
            callSound.play();
            
            handleCall(floor);
        }
    });
});
