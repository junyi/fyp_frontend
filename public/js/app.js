(function() {
    $('#dataopt').change(function(e){
        var option = $(this).val();
        var link;
        switch (option) {
            case 'jc':
                link = 'job_category_by_date';
                break;
            case 'i':
                link = 'industry_by_date';
                break;
            case 'et':
                link = 'emp_type_by_date';
                break;
            case 'l':
                link = 'location_by_date';
                break;
            case 'jl':
            default:
                link = 'job_level_by_date';
                break;
        }

        updateGraph('/fyp/' + link);
    });

    var parent = $("#graph").parent();
    var parentWidth = parent.width();

    var graph = d3.select("#graph")
        .append("svg")
        .chart("Streamgraph")
        .width(parentWidth)
        .height(parentWidth/(2.5));

    function updateGraph(link) {
        d3.json(link, function(err, json) {
            graph.draw(json);
        });
    }

    updateGraph('/fyp/job_level_by_date');

})();