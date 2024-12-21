document.addEventListener("DOMContentLoaded", function () {
    fetch('/index-content')
    .then(response => response.text())
    .then(data => {
        document.getElementById('main-content').innerHTML = data;
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
            };

            fetch("/addSubject", {
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
            } else {
                window.alert(data.message);
            }
            })
            .catch(err => console.error('error: ', err));
        });

        var button = document.getElementById("add-subject-button");
        button.addEventListener("click", function () {
            showSection(button);
        });
        })
    .catch(error => console.error('Errore nel caricamento:', error));

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            document.querySelector('.nav-item.active')?.classList.remove('active');
            this.classList.add('active');
        });
    });
});

function showSection(button) {
    document.getElementById("add-subject-section").style.display = 'flex';
    button.style.display = 'none';
};

function loadContent(id) {
    if (id === "home") {
        fetch('/index-content')
        .then(response => response.text())
        .then(data => {
            document.getElementById('main-content').innerHTML = data;
        })
        .catch(error => console.error('Errore nel caricamento:', error));
    }
    if (id === "stats") {
        fetch('/stats')
        .then(response => response.text())
        .then(data => {
            document.getElementById('main-content').innerHTML = data;
            function gradesDistribution() {
                let grades_dict = JSON.parse(document.getElementById("grade-bar").dataset.value);
            
                const ctx = document.getElementById('bar-grade-graph').getContext('2d');
                const config = {
                    type: 'bar',
                    data: {
                        labels: Object.keys(grades_dict),
                        datasets: [{
                            label: 'Grade Proportions',
                            data: Object.values(grades_dict),
                            backgroundColor: '#a37cf7',
                            borderColor: '#a37cf7',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Grade'
                                }
                            },
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                },
                                title: {
                                    display: true,
                                    text: 'Number of appereances'
                                }
                            }
                        }
                    }
                };
                new Chart(ctx, config);
            }
            gradesDistribution();
    
            document.getElementById('bar-grade-graph').addEventListener('touchstart', function(e) {
                e.preventDefault(); 
            });
            
            document.getElementById('average-grade-over-time').addEventListener('touchstart', function(e) {
                e.preventDefault(); 
            });
            
            fetch('/getAverageByDate', {
                method: 'GET',
                cache: 'no-store'
            })
            .then(response => response.json())
            .then(data => {

                const dataMain = data.data;
                const roundedData = data.data_rounded;

                const labels = dataMain.map(item => item.date);
                const mainAverages = dataMain.map(item => item.average_grade)
                const roundedAverages = roundedData.map(item => item.average_grade);

                const ctx = document.getElementById('average-grade-over-time').getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Average Grade',
                            data: mainAverages,
                            fill: false,
                            borderColor: '#a37cf7',
                            backgroundColor: '#a37cf7',
                            tension: 0.1
                        },
                        {
                            label: 'Rounded Average Grade',
                            data: roundedAverages,
                            fill: false,
                            borderColor: '#f774a3',
                            backgroundColor: '#f774a3',
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
        })
        .catch(error => console.error('Errore nel caricamento:', error));
    }
    if (id === "settings") {
        fetch('/settings')
        .then(response => response.text())
        .then(data => {
            document.getElementById('main-content').innerHTML = data;
        })
        .catch(error => console.error('Errore nel caricamento:', error));
    }
}

function redirect(subject) {

    var data = {
        subject_redirect: subject
    };

    fetch("/redirect", {
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
