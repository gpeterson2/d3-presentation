import random

from flask import (
    Flask,
    jsonify,
    render_template,
)

app = Flask(__name__)

@app.route('/')
def display_index():
    return render_template('index.html')

@app.route('/bar_chart')
def display_bar_chart():
    ''' Display the bar chart. '''

    return render_template('bar_chart.html')

@app.route('/get_random_list/<int:data_count>')
def get_random_list(data_count):
    ''' Get a random list of data.

        Returns a list of size data_count of numbers between 1 and 100.
    '''

    data = [random.randint(0, 100) for i in range(data_count)]
    return jsonify({ 'data': data })

if __name__ == '__main__':
    app.run(debug=True)

