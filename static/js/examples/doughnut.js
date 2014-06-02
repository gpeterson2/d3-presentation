/* jshint laxcomma: true */
/* global jQuery, d3, alert */

/*
    In some places I'm using jQuery just because it's easier to do so.

    Technically you could use any other framework, or use d3 to do some of
    this.
*/

(function($) {
    var width = 400;
    var height = 200;
    var legendWidth = 100;
    var legendHeight = 100;

    var radius = Math.min(width, height) / 2;

    // Set the specific color's based on the elements returned later
    // on, rather than hard-coding them here. Still define the color
    // ordinal here.
    var color = d3.scale.ordinal();
        //.range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);

    // Helper functions to figure out the slice later on.
    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(radius - 50);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });

    // Create the svg element.
    // Alternately this could be in the html.
    var svg = d3.select('#container').append('svg')
            .attr('width', width)
            .attr('height', height)
        .append('g')
            .attr('transform', function(d, i) {
                // Want to reserve some space for the legend.
                var w = (width / 2) - legendWidth;
                var h = height / 2;
                return 'translate(' + w + ',' + h + ')';
            });

    var load_data = function() {
        $.ajax({
            dataType: "json"
            , url: '/doughnut/data'
            , type: 'GET'
            , success: function(data, status, xhr) {
                redrawChart(data.items);
            }
            , error: function(xhr, status, error) {
                alert(error);
            }
        });
    };

    $('#Randomize').click(function() {
        load_data();
    });

    // Gets the total for display
    var getTotal = function(data) {
        var total = 0, i, item;
        for (i = 0; i < data.length; i++) {
            total += data[i].value;
        }
        return total;
    };

    // Updates the data and title.
    var redrawChart = function(data) {
        var total = getTotal(data);

        // Show the item cound in a list.
        var item_list = $('#ItemList');
        item_list .html('');
        $.each(data, function(i, d) {
            var item = $('<li></li>').text(d.name + ': ' + d.value);
            item_list.append(item);
        });

        //******************************************************//
        // NOTE - SVG elements place subsequent items on top
        //        of previoius elements. So order matters.
        //******************************************************//

        // Clear old data
        svg.selectAll('.Title').remove();
        svg.selectAll('g').remove();
        svg.selectAll('.Legend').remove();

        // Figure out included colors.
        var i, colors = [];
        for (i = 0; i < data.length; i++) {
            colors.push(data[i].color);
        }
        // Set the colors using the ordinal defined above.
        color.range(colors);

        // Set up the arcs
        var g = svg.selectAll('.arc')
            .data(pie(data))
            .enter().append('g')
            .attr('class', 'arc');

        // Draw the arcs.
        g.append('path')
            .attr('d', arc)
            .style('fill', function(d) {
                return color(d.data.name);
            });
       // Add title. This is in two sections because you can't
        // easily add newlines to SVG text. Or if you can I stopped
        // looking before finding it.
        //
        // Add Total above the main message and slightly bigger.
        svg.append('text')
            .attr('class', 'Title Total')
            .attr('dy', -10) // Move the element up a little.
            .text(total);

        // Add "items earned" text
        svg.append('text')
            .attr('class', 'Title')
            .attr('dy', 10)
            .text('Items Earned');

        // Add a legend.
        var legend = svg.append('g')
            .attr('class', 'Legend')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .attr('transform', function(d, i) {
                var w = legendWidth;
                // Center the lenged.
                var h = -(legendHeight / 2);
                return 'translate(' + w + ',' + h + ')';
            });

        // Define the specific items.
        var lengendItemHeight = 25; // TODO move this up.
        var legend_items = legend.selectAll('g').data(data)
            .enter().append('g')
            .attr('transform', function(d, i) {
                var h = i * lengendItemHeight;
                return 'translate(0, ' + h + ')';
            });

        // Color boxes.
        var legendBoxSize = 20; // TOOD - move this up.
        legend_items.append('rect')
            .attr('width', legendBoxSize)
            .attr('height', legendBoxSize)
            .style('fill', function(d, i) {
                return color(i);
            });

        // Color values
        legend_items.append('text')
            .attr('class', 'LegendDisplayValues')
            .attr('x', 1)
            .attr('y', legendBoxSize - 5)
            //.attr('fill', 'white')
            .text(function(d, i) {
                return d.value;
            });

        // Text display.
        legend_items.append('text')
            .attr('class', 'LegendDisplayNames')
            .attr('x', 24)
            .attr('y', 9)
            .attr('dy', '.35em')
            .text(function(d) {
                return d.name;
            });
    };

    // Load initial data.
    load_data();

}(jQuery));
