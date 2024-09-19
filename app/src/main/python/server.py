'''Server in python using flask'''
import json
from flask import Flask, render_template, request, jsonify, url_for, abort # module for the local server
import database


app = Flask(__name__) # setting the server files


@app.errorhandler(404)
def return_404(error):
    return 'subject not found', 404


@app.route("/editGrade", methods=['POST'])
def edit_grade():
    gradeData = request.get_json()
    print(gradeData)
    return jsonify({'ok': True, 'message': 'grade modified'})


@app.route("/<subject>", methods=['GET', 'POST'])
def return_subject_page(subject):
    if request.method == "POST":
        gradeData = request.get_json()
        code = gradeData.get('code')
        if code == '002':
            response = database.add_grade(grade=gradeData['grade'], subject_name=gradeData['subject'], date=gradeData['date'],weight=gradeData['grade_weight'], type_=gradeData['type'])
            if response:
                return jsonify({'message': 'grade added successfully'}), 201
            else:
                return jsonify({'message': 'error while adding a grade'}), 400
        if code == '004':
            response = database.delete_grade(id=gradeData['id'])
            if response:
                return jsonify({'message': 'grade deleted successfully'}), 201
            else:
                return jsonify({'message': 'error while deleting a grade'}), 400

    if subject in database.list_subjects():
        return render_template("subject.html", subject=subject, grades=database.list_grades(subject), average=database.return_average(subject))
    else:
        abort(404)


@app.route("/", methods=["GET", "POST"])
def return_index():
    if request.method == "POST":
        subject: json = request.get_json()
        code = subject.get('code')
        if code and code == '001':
            response = database.add_subject(subject['subject'])
            if response == True:
                return jsonify({'message': 'subject added successfully'}), 201
            elif response == "duplicate subject" :
                return jsonify({'message': 'the subject already exists'}), 400
            else:
                return jsonify({'message': 'errors while adding a subject'}), 400
        else:
            subject_redirect = subject['subject_redirect']
            return jsonify({'redirect': url_for('return_subject_page', subject=subject_redirect)})

    return render_template("index.html", grade_bar=json.dumps(database.return_grade_proportions()), averages_list=database.return_averages(), subjects_list = database.list_subjects(), general_average=database.return_general_average())


@app.route("/getAverageByDate", methods=['GET'])
def get_average_by_date():
    data = database.return_average_by_date()
    return jsonify(data)


def main():
    app.run(debug=False, host="127.0.0.1", port=5000)
