/* global jQuery */
(function() {

    var slides = [];
    var titles = [];

    var slide_count = $('.slide').length;
    console.log(slide_count);
    $('.slide').each(function(i, d) {
        var el = $(this);

        // hide the elements.
        el.hide();

        slides.push(el);

        // Get the title for nav links.
        var title = el.find('.title').html();
        titles.push(title);

        // Add previous/next
        var previous_link = '';
        var next_link = '';

        if (i > 0) {
            previous_link = $('<a></a>')
                .attr('href', '#')
                .attr('index', i - 1)
                .text('Previous');
        }

        if (i < slide_count - 1) {
            next_link = $('<a></a>')
                .attr('href', '#')
                .attr('index', i + 1)
                .text('Next');
        }

        var index_link = $('<a></a>')
            .attr('href', '#')
            .attr('index', 0)
            .text('Top');

        var page_nav = $('<span></span>')
            .addClass('page_nav');

        page_nav.append([previous_link, index_link, next_link]);
        el.append(page_nav);
    });

    // Make titles into nav links.
    var el = $('.nav')
    $.map(titles, function(d, i) {

        var link = $('<a></a>')
            .attr('href', '#')
            .attr('index', i)
            .text(d);

        var item = $('<li></li>').html(link);

        el.append(item);
    });

    // Show/hide the appropriate slides when clicked.
    $('.nav a, .page_nav a').click(function(e) {
        e.preventDefault();

        // Get the id.
        var id = $(this).attr('index');

        // hide all sildes.
        $('.slide').hide();

        // Show the one we want.
        slides[id].show();
    });

    // Show the first slide.
    slides[0].show();

}(jQuery))
