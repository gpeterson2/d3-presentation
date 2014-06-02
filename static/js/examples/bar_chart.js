/* jshint laxcomma: true */
/* global jQuery, d3 */


/*
    In some places I'm using jQuery just because it's easier to do so.

    Technically you could use any other framework, or use d3 to do some of
    this.
*/

(function($, d3) {
    // Store data globally, so the inital values can stored and other
    // functions can be applied to it prior to display.
    var dataset = [];

    // Set margins so that space is reserved for the axis.
    var margin = {top: 40, right: 20, bottom: 30, left: 50};

    var width = 900 - margin.left - margin.right;
    var heigth = 500 - margin.left - margin.right;

    // Define the body
    var body = d3.select('.chart').append('svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', heigth + margin.top + margin.bottom)

    // Set the overall scales
    // TODO - explain why these scales were choosen.
    var xScale = d3.scale.ordinal()
        .rangeRoundBands([0, width], 0.1);

    var yScale = d3.scale.linear()
        .range([heigth, 0]);

    // Partially define the axis, further options will be added prior to
    // display.
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left');

    // Helper to get selected options
    function get_options() {
        var show_bar = $('#ShowBar').prop('checked');
        var show_line = $('#ShowLine').prop('checked');
        var show_numbers = $('#ShowNumbers').prop('checked');
        var sort_type = $('#SortType').val();

        return {
            ShowBar: show_bar
            , ShowLine: show_line
            , ShowNumbers: show_numbers
            , SortType: sort_type
        };
    }

    // Gets the data and on success loads the chart.
    var get_data = function(amount) {
        // Could also set this as a param.
        var url = '/get_random_list/' + amount

        $.ajax({
            dataType: "json"
            , url: url
            , type: 'GET'
            , success: function(data, status, xhr) {
                // store data globally, so any sorts won't destroy the inital
                // sorting.
                dataset = data.data;

                var options = get_options();
                generate_charts(dataset, options);
            }
            , error: function(xhr, status, error) {
                alert(error);
            }
        });
    };

    // Run when you select randomize button.
    $('.RandomizeButton').click(function() {
        var amount = $('#DataAmount').val() || 10;

        get_data(amount);
    });

    // Run when you check one of the boxes
    $('.ShowBar, .ShowLine, .ShowNumbers').on('click', function() {
        var options = get_options();
        generate_charts(dataset, options);
    });

    // Run when you change the sorting.
    $('#SortType').on('change', function() {
        var options = get_options();
        generate_charts(dataset, options);
    });

    // Colors for the bar chart.
    var colors = ['red', 'blue', 'yellow'];

    // Actually displays the charts.
    var generate_charts = function(dataset, options) {

        // Grab a local copy of the overall data.
        var local_data = dataset.slice();

        // If neither sort is selected, then stick with the original order.
        var sort_type = options.SortType;
        if (sort_type == 'ASC') {
            local_data.sort(d3.ascending);
        } else if (sort_type == 'DESC') {
            local_data.sort(d3.descending);
        }

        // Display the data.
        var el = $('#data');
        el.html('');
        var data_display = []
        for (i = 0; i < local_data.length; i ++ ) {
            var item = local_data[i];
            data_display.push($('<li></li>').text(item));
        }
        el.append(data_display);

        // Set scale info that couldn't be determined before.

        // Display scale as 1 ... instead of 0 ...
        // This means any use of xScale for orientation has to be updated
        // by one.
        xScale.domain(d3.range(1, local_data.length + 1))

        // Set yScale to 100
        yScale.domain([0, 100])
        // You could also set it to the max data, for example.
        //yScale.domain([0, d3.max(local_data)])

        // Clear out old data
        body.selectAll('g').remove();

        // Start adding new data.
        // translate sets aside space for the axis.
        var group = body.append('g')
            .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

        // Create "max" line at 80.
        // This will be "behind" everything else because it's set first.
        var max_line = group.append('svg:line')
            .attr('x1', function(d) {
                // "1" is the start of the scale
                return xScale(1);
            })
            .attr('x2', function(d) {
                // Use rangeband so it goes to the end of the axis
                return xScale(local_data.length) + xScale.rangeBand();
            })
            .attr('y1', function(d) { return yScale(80); })
            .attr('y2', function(d) { return yScale(80); })
            .attr('class', 'max_line')

        // Create bar chart
        if (options.ShowBar) {
            group.selectAll('rect')
                .data(local_data)
                .enter()
                .append('rect')
                .attr('x', function(d, i) {
                    return xScale(i + 1);
                })
                .attr('y', function(d) {
                    return  yScale(d);
                })
                .attr('width',  xScale.rangeBand())
                .attr('height', function(d) {
                    return heigth - yScale(d);
                })
                .attr('class', 'bar_lines')
                // Fill them based on selected colors.
                .attr('fill', function(d, i) {
                    return colors[i % colors.length];

                    // This would set them to a shade of blue based on height.
                    //return 'rgb(0, 0, ' + (d * 10) + ')';
                });
        }

        // Create line chart
        if (options.ShowLine) {
            var line = d3.svg.line()
                .x(function(d, i) {
                    // Use range band so it centers on the axis value
                    return xScale(i + 1) + (xScale.rangeBand() / 2);
                })
                .y(function(d) { return yScale(d); });

            // Transitions still don't seem to do anything.
            group.selectAll('path')
                .data([local_data])
                .enter().append('path')
                .attr('class', 'line')
                .attr('d', line);

            // Add "circle" points
            group.selectAll('circle')
                .data(local_data).enter().append('circle')
                .attr('cx', function(d, i) {
                    // use rangeband so it's centered on the axis number
                    return xScale(i + 1) + (xScale.rangeBand() / 2);
                })
                .attr('cy', function(d) { return yScale(d); })
                .attr('r', 5)
                .attr('class', 'points')
                // Simple tooltip
                .append('svg:title').text(function(d) {
                    return d;
                });
        }


        // Add text to line chart.
        if (options.ShowNumbers) {
            group.selectAll('text')
                .data(local_data)
                .enter()
                .append('text')
                .text(function(d) {
                    return d;
                })
                .attr('x', function(d, i) {
                    // use rangeband so it's centered on the axis number
                    return xScale(i + 1) + xScale.rangeBand() / 2;
                })
                .attr('y', function(d, i) {
                    // 20 choosen because it looked the best, probably another
                    // way of doing this
                    return yScale(d) - 20;
                })
                .attr('class', 'value_display')
        }

        // Add axis

        // Limit the displayed amout of ticks based on data size
        // Should only return 10 total no matter how big the dataset.
        // Or just set it as as Logarithmic scale?
        xAxis.tickFormat(function(d) {
            var max = Math.floor(local_data.length / 10);
            if (d % max == 0) {
                return d;
            }
            return '';
        });

        group.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0, ' + heigth + ')')
            .call(xAxis)

        group.append('g')
            .attr('class', 'y axis')
            .call(yAxis);
    }

    // Get some inital data.
    get_data(10);

}(jQuery, d3))
