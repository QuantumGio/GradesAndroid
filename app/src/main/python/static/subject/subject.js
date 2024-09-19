document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("add-grade-button");
    button.addEventListener("click", function () {
        showSection(button);
    });
    var formGrade = document.getElementById("add-grade-section");
    formGrade.addEventListener('submit', function (event) {
        event.preventDefault();
        var grade = document.getElementById("grade").value;
        var gradeWeight = document.getElementById("grade-weight").value;
        var regex = /^[a-zA-z]+$/;
        if (!!regex.test(grade) && !!regex.test(gradeWeight)) {
            window.alert("letters detected in the grade or in the grade weight");
            return false;
        };
        let submitButton = document.getElementById("submit-button");
        if (submitButton.textContent == "Add grade") {
            var data = {
                subject: document.title,
                grade: grade,
                code: '002',
                date: document.getElementById("grade-date").value,
                grade_weight: gradeWeight,
                type: document.getElementById('type').value
            };
            fetch("http://127.0.0.1:5000/" + document.title, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(function (response) { return response.json(); })
            .then(function (data) {
            if (data.message.startsWith('grade added')) {
                window.alert(data.message);
                window.location.reload();
            }
            else {
                window.alert(data.message);
            }
            })
            .catch(function (error) { return console.error('error: ', error);
            });
        } else {
            sendEditGrade();
        }
    });
});

function showSection(button) {
    document.getElementById("add-grade-section").style.display = 'flex';
    button.style.display = 'none';
}
;

function deleteGrade(id) {
    var data = {
        code: '004',
        id: id
    };
    fetch("http://127.0.0.1:5000/" + document.title, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(function (response) { return response.json(); })
    .then(function (data) {
    if (data.message.startsWith('grade deleted')) {
        window.alert(data.message);
        window.location.reload();
    }
    else {
        window.alert(data.message);
    }
    })
    .catch(function (error) { return console.error('error: ', error); });
}

function goBack() {
    window.history.back();
}

function editGrade(id_, grade_, date_, weight_, type_) {
    showSection(document.getElementById("add-grade-button"));

    let grade = document.getElementById("grade");
    grade.value = grade_;

    let date = document.getElementById("grade-date");
    date.value = date_;

    let weight = document.getElementById("grade-weight");
    weight.value = weight_;

    let type = document.getElementById("type");
    type.value = type_;

    let submitButton = document.getElementById("submit-button");
    submitButton.innerText = "Edit grade";
    window.global_id = id_ // needed to use a global variable
}

function sendEditGrade() {
    var grade = document.getElementById("grade").value;
    var gradeWeight = document.getElementById("grade-weight").value;
    var regex = /^[a-zA-z]+$/;
    if (!!regex.test(grade) && !!regex.test(gradeWeight)) {
        window.alert("letters detected in the grade or in the grade weight");
        return false;
    };
    let data = {
        subject: document.title,
        grade: grade,
        date: document.getElementById("grade-date").value,
        grade_weight: gradeWeight,
        type: document.getElementById('type').value,
        grade_id: window.global_id
    };
    console.log(data)
    fetch("/editGrade", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(res => {return res.json()})
    .then(data => {
        if (data.ok) {
            window.alert("grade modified successfully");
        } else {
            window.alert("error while editing a grade, try again!");
        }
    })
}
