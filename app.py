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

@app.route('/doughnut')
def display_doughnut_chart():
    ''' Display doughnut chart page. '''

    return render_template('doughnut.html')

@app.route('/doughnut/data')
def get_doughnut_items():
    ''' Return an array of items with random values. '''

    # Helper so you don't repeat 1, 100.
    get_random = lambda: random.randint(1, 100);

    data = [
        {'name': 'MEGA', 'value': get_random(), 'color': '#CC0033'},
        {'name': 'ULTRA', 'value': get_random(), 'color': '#CC33CC'},
        {'name': 'EPIC', 'value': get_random(), 'color': '#CC6600'},
    ]

    return jsonify({'items': data})

if __name__ == '__main__':
    #app.run(debug=True)
    app.run(debug=True, host='0.0.0.0', port=5000)

