'''Script that runs the operation on the database'''
import sqlite3 # module to import to work with local databases

path = "/data/data/com.iohannes.grades/files/grades.sqlite3"

def create_database(fun):
    '''Decorator to create the database if it doesn't exists'''
    def wrapper(*args, **kwargs):
        connection = sqlite3.connect(path)
        cursor = connection.cursor()
        command = """ CREATE TABLE IF NOT EXISTS subject_list (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT UNIQUE);""" # create the main table
        command_2 = """CREATE TABLE IF NOT EXISTS grades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_name TEXT,
            grade REAL,
            date INTEGER,
            weight REAL,
            type TEXT);""" # create the table where the grades are stored
        command_3 = """ CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            primary_colour TEXT); """
        cursor.execute(command)
        cursor.execute(command_2)
        cursor.execute(command_3)
        connection.commit()
        connection.close()

        result = fun(*args, **kwargs)

        return result
    return wrapper


@create_database
def add_subject(subject: str):
    '''function to add a subject in the subject_list'''
    command = f"INSERT INTO subject_list (subject) VALUES ('{subject.upper()}');"
    try:
        connection = sqlite3.connect(path)
        cursor = connection.cursor()
        cursor.execute(command)
        connection.commit()
        return True
    except sqlite3.IntegrityError as e:
        print(e, command)
        return "duplicate subject"
    except Exception:
        return False
    finally:
        connection.close()


@create_database
def list_subjects() -> list:
    '''function to return all subjects added'''
    command = "SELECT * FROM subject_list"
    subject_list = []
    try:
        connection = sqlite3.connect(path)
        cursor = connection.cursor()
        cursor.execute(command)
        for _,y in cursor:
            subject_list.append(y)
        connection.commit()
        return subject_list
    except Exception as e:
        print(e)
        return subject_list
    finally:
        connection.close()


@create_database
def add_grade(subject_name, grade, date, weight, type_) -> bool:
    '''function that adds a grade'''
    command = f"INSERT INTO grades (subject_name, grade, date, weight, type) VALUES ('{subject_name}', '{grade}', '{date}', '{weight}', '{type_}')"
    try:
        connection = sqlite3.connect(path)
        cursor = connection.cursor()
        cursor.execute(command)
        connection.commit()
        return True
    except Exception as e:
        print(e, command)
        return False
    finally:
        connection.close()

@create_database
def list_grades(subject: str) -> list:
    '''function that returns a list of all the grades depending on the subject'''
    command = f"SELECT * FROM grades WHERE subject_name = '{subject}'"
    grades_list = []
    try:
        connection = sqlite3.connect(path)
        cursor = connection.cursor()
        cursor.execute(command)
        for b,_,x,y,z,a in cursor:
            grade_tuple = (b,x,y,z,a)
            grades_list.append(grade_tuple)
        connection.commit()
        return grades_list
    except Exception as e:
        print(e)
        return grades_list
    finally:
        connection.close()

@create_database
def list_all_grades() -> list:
    '''function that returns a list of all the grades'''
    command = "SELECT grade FROM grades;"
    grades_dict = []
    try:
        connection = sqlite3.connect(path)
        cursor = connection.cursor()
        cursor.execute(command)
        for grade in cursor:
            grades_dict.append(grade[0])
        return grades_dict
    except Exception as e:
        print(e)
        return grades_dict
    finally:
        connection.close()

def return_grade_proportions() -> dict:
    '''function that returns how many times a grade appears, considering only the first digit'''
    base_list = list_all_grades()
    grade_proportions_dict = {}
    for x in range(11):
        grade_proportions_dict[x] = 0
    for grade in base_list:
        grade_proportions_dict[int(grade)] = grade_proportions_dict.get(int(grade), 0) + 1

    return grade_proportions_dict


@create_database
def return_average_by_date() -> list:
    '''funcion that returns averages by date'''
    command = """
    WITH cumulative_grades AS (
    SELECT date, grade, weight
    FROM grades
    ORDER BY date
    ),
    cumulative_averages AS (
    SELECT date,
        (SELECT SUM(cg2.grade * cg2.weight) / SUM(cg2.weight)
        FROM cumulative_grades cg2
        WHERE cg2.date <= cg1.date) AS average_grade
    FROM cumulative_grades cg1
    GROUP BY date
    )
    SELECT date, average_grade
    FROM cumulative_averages
    ORDER BY date;
    """

    try:
        connection = sqlite3.connect(path)
        cursor = connection.cursor()
        cursor.execute(command)
        rows = cursor.fetchall()

        result = [{'date': row[0], 'average_grade': row[1]} for row in rows]
        return result

    except Exception as e:
        print(e)
        return []
    finally:
        connection.close()


@create_database
def return_average(subject: str) -> str:
    '''function to return the average grade of a subject'''
    command = f"SELECT SUM(grade*weight)/SUM(weight) AS average_grade FROM grades WHERE subject_name = '{subject}'"
    try:
        connection = sqlite3.connect(path)
        cursor = connection.cursor()
        cursor.execute(command)
        average = cursor.fetchone()
        average_grade = average[0]
        return f'{average_grade:.2f}'
    except Exception as e:
        print(e)
        return 'N/A'
    finally:
        connection.close()


@create_database
def return_averages() -> list:
    '''function to return all the averages grouped by subject'''
    command = "SELECT subject_name, SUM(grade*weight)/SUM(weight) AS average_grade FROM grades GROUP BY subject_name;"
    averages_list = []
    try:
        connection = sqlite3.connect(path)
        cursor = connection.cursor()
        cursor.execute(command)
        averages = cursor.fetchall()
        for subject, average in averages:
            averages_tuple = (subject, round(average, 2))
            averages_list.append(averages_tuple)
        subjects = list_subjects()
        subjects_set = set(subjects)
        subjects_check = []
        for subject in averages_list:
            subjects_check.append(subject[0])
        subjects_check_set = set(subjects_check)
        subjects_to_add = (subjects_set-subjects_check_set)
        if len(subjects_to_add) == 0:
            return averages_list
        else:
            for subject in subjects_to_add:
                subject_tuple = (subject, 'N/A')
                averages_list.append(subject_tuple)
            return averages_list
    except Exception as e:
        print(e, command)
        return averages_list
    finally:
        connection.close()


@create_database
def return_general_average() -> str:
    '''function to return the general average'''
    command = "SELECT SUM(grade*weight)/SUM(weight) AS average_grade FROM grades;"
    try:
        connection = sqlite3.connect(path)
        cursor = connection.cursor()
        cursor.execute(command)
        average = cursor.fetchone()
        general_average = average[0]
        return f'{general_average:.2f}'
    except Exception as e:
        print(e)
        return 'N/A'
    finally:
        connection.close()

@create_database
def delete_grade(id_: str):
    '''function that deletes a grade gived its id'''
    command = f"DELETE FROM grades WHERE id = {int(id_[13:])};"
    try:
        connection = sqlite3.connect(path)
        cursor = connection.cursor()
        cursor.execute(command)
        connection.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        connection.close()


@create_database
def edit_grade(data: dict):
    '''function that edits a grade given its id'''
    command = f"UPDATE grades SET subject_name = '{data['subject']}', grade = '{data['grade']}', date = '{data['date']}', weight = '{data['grade_weight']}', type = '{data['type']}' WHERE id = '{int(data['grade_id'])}'"
    try:
        connection = sqlite3.connect(path)
        cursor = connection.cursor()
        cursor.execute(command)
        connection.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        connection.close()


@create_database
def set_primary_colour(colour: str):
    '''function that sets a primary color'''
    check_list = []
    try:
        connection = sqlite3.connect(path)
        cursor = connection.cursor()
        command_first = "SELECT * FROM settings"
        cursor.execute(command_first)
        for x in cursor:
            check_list.append(x)
        if check_list:
            command = f"UPDATE settings SET primary_colour = '{colour}' WHERE id = 1"
            cursor.execute(command)
            connection.commit()
            return True
        command = f"INSERT INTO settings (primary_colour) VALUES ('{colour}')"
        cursor.execute(command)
        connection.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        connection.close()


@create_database
def delete_subject(subject: str):
    '''function that deletes a subject'''
    ...
    # TODO
