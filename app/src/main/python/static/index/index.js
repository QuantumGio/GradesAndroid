document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("add-subject-button");
    button.addEventListener("click", function () {
        showSection(button);
    });
    var formSubject = document.getElementById("add-subject-section");
    formSubject.addEventListener('submit', function (event) {
        event.preventDefault();
        var subject = document.getElementById("subject").value;
        var regex = /^[a-zA-z]+$/;
        if (!regex.test(subject)) {
            window.alert("special characters or numbers in subject name");
            return false;
        }
        ;
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
        .then(function (response) { return response.json(); })
        .then(function (data) {
        if (data.message.startsWith('subject added')) {
            window.alert(data.message);
            window.location.reload();
        }
        else {
            window.alert(data.message);
        }
    })
        .catch(function (error) { return console.error('error: ', error); });
    });

    fetch('/getAverageByDate')
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
}
;
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
        .then(function (response) { return response.json(); })
        .then(function (data) {
        if (data.redirect) {
            window.location.href = data.redirect;
        }
        else {
            window.alert("error while going to subject: " + subject);
        }
    })
        .catch(function (error) { return console.error('error: ', error); });
}
