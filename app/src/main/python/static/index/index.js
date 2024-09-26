document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("add-subject-button");
    button.addEventListener("click", function () {
        showSection(button);
    });

    gradesDistribution();

    var formSubject = document.getElementById("add-subject-section");
    formSubject.addEventListener('submit', function (event) {
        event.preventDefault();

        var subject = document.getElementById("subject").value;
        var regex = /^[a-zA-z]+$/;
        if (!regex.test(subject)) {
            window.alert("special characters or numbers in subject name");
            return false;
        };

        var data = {
            subject: subject,
            code: '001'
        };

        fetch("http://127.0.0.1:5000", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(res =>  res.json())
        .then(data => {
        if (data.ok) {
            window.alert(data.message);
            window.location.reload();
        }
        else {
            window.alert(data.message);
        }
        })
        .catch(err => console.error('error: ', err));
    });

    fetch('/getAverageByDate', {
        method: 'GET',
        cache: 'no-store'
    })
    .then(response => response.json())
    .then(data => {

        const labels = data.map(item => item.date);
        const averages = data.map(item => item.average_grade);

        const ctx = document.getElementById('average-grade-over-time').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Grade',
                    data: averages,
                    fill: false,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Average Grade'
                        },
                        beginAtZero: true,
                        min: 0,
                        max: 10
                    }
                }
            }
        });
    });
});

function showSection(button) {
    document.getElementById("add-subject-section").style.display = 'flex';
    button.style.display = 'none';
};

function redirect(subject) {

    var data = {
        subject_redirect: subject
    };

    fetch("http://127.0.0.1:5000/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
    if (data.redirect) {
        window.location.href = data.redirect;
    }
    else {
        window.alert("error while going to subject: " + subject);
    }
    })
    .catch(err => console.error('error: ', err));
}

function gradesDistribution() {
    let grades_dict = JSON.parse(document.getElementById("grade-bar").dataset.value);

    var ctx = document.getElementById('bar-grade-graph').getContext('2d');
    const config = {
        type: 'bar',
        data: {
            labels: Object.keys(grades_dict),
            datasets: [{
                label: 'Grade Proportions',
                data: Object.values(grades_dict),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    };
    var barGraph = new Chart(ctx, config);
}
document.getElementById('bar-grade-graph').addEventListener('touchstart', function(e) {
    e.preventDefault();
});

document.getElementById('average-grade-over-time').addEventListener('touchstart', function(e) {
    e.preventDefault();
});


var modal = document.getElementById("popup");
var btn = document.getElementById("settings");
var span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
    modal.style.display = "block";
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
