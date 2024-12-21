'''Server in python using flask'''
import json
from flask import Flask, render_template, request, jsonify, url_for, abort # module for the server
import database


app = Flask(__name__) # setting the server files


@app.errorhandler(404)
def return_404(error):
    '''generic return 404 error'''
    return render_template("404.html"), 404


@app.route("/editGrade", methods=['POST'])
def edit_grade():
    '''post method to edit a grade'''
    grade_data = request.get_json()
    edit_status = database.edit_grade(grade_data)
    if edit_status:
        return jsonify({'ok': True, 'message': 'grade modified'}), 200
    return jsonify({'ok': False, 'message': 'grade not modified, try again'}), 400

@app.route("/subject/<subject>", methods=['GET'])
def return_subject_page(subject):
    '''return subject page'''
    if subject in database.list_subjects():
        return render_template("subject.html", subject=subject, grades=database.list_grades(subject), average=database.return_average(subject)), 200
    abort(404)


@app.route("/addGrade", methods=['POST'])
def add_grade():
    '''adds a grade received from the web page'''
    grade_data = request.get_json()
    response = database.add_grade(grade=grade_data['grade'], subject_name=grade_data['subject'], date=grade_data['date'],weight=grade_data['grade_weight'], type_=grade_data['type'])
    if response:
        return jsonify({'ok':True, 'message': 'grade added successfully'}), 200
    return jsonify({'ok':False, 'message': 'error while adding a grade'}), 400


@app.route("/deleteGrade", methods=['POST'])
def delete_grade():
    '''deletes a grade given an input from the web page'''
    grade_data = request.get_json()
    response = database.delete_grade(id_=grade_data['id'])
    if response: return jsonify({'ok':True, 'message': 'grade deleted successfully'}), 201
    return jsonify({'ok':False, 'message': 'error while deleting a grade'}), 400


@app.route("/", methods=["GET"])
def return_index():
    '''return home page'''
    return render_template("index.html", averages_list=database.return_averages(), subjects_list = database.list_subjects(), general_average=database.return_general_average()), 200


@app.route("/index-content", methods=['GET'])
def return_content():
    '''return home page content'''
    return render_template("index-content.html", averages_list=database.return_averages(), subjects_list = database.list_subjects(), general_average=database.return_general_average(), general_average_rounded=database.return_average_by_date()), 200

@app.route("/addSubject", methods=['POST'])
def add_subject():
    '''adds a subject given by the web page'''
    subject: json = request.get_json()
    response = database.add_subject(subject['subject'])
    if response is True:
        return jsonify({'ok':True, 'message': 'subject added successfully'}), 201
    if response == "duplicate subject":
        return jsonify({'ok':False, 'message': 'the subject already exists'}), 400
    return jsonify({'ok':False, 'message': 'errors while adding a subject'}), 400


@app.route("/redirect", methods=['POST'])
def redirect():
    '''redirects to the subject page'''
    subject: json = request.get_json()
    subject_redirect = subject['subject_redirect']
    return jsonify({'redirect': url_for('return_subject_page', subject=subject_redirect)}), 200


@app.route("/getAverageByDate", methods=['GET'])
def get_average_by_date():
    '''get request to return the average by date'''
    data, data_rounded = database.return_average_by_date()
    return jsonify({'data': data, 'data_rounded': data_rounded}), 200


@app.route("/stats", methods=['GET'])
def render_charts():
    '''redirects to stats page'''
    return render_template("stats.html", grade_bar=json.dumps(database.return_grade_proportions())), 200


@app.route("/settings", methods=['GET'])
def redirect_settings():
    '''redirects to settings page'''
    return render_template("settings.html"), 200


def main():
    app.run(debug=False, host="127.0.0.1", port=5000)
