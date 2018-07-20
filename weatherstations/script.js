// Author:Andri Karel Júlíusson
$(document).ready(function () {

    var station = 1;
    $("#menu-toggle").click(function (e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });
    //API call for selected weather station
    function getWeatherInfo(station) {
        var time = [];
        var windSpeed = [];
        var rain = [];
        var heat = [];
        var dM = [];
        var atime;
        var location;
        var weatherInfo = [];
        var cleanResult = [];

        $.ajax({
            async: false,
            type: 'GET',
            url: 'http://apis.is/weather/forecasts/en',
            dataType: 'json',
            data: { 'stations': station },
            success: function (data) {
                location = data.results[0].name;
                atime = data.results[0].forecast[0].ftime;
                cleanResult = data.results;
                $.each(data.results[0].forecast, function (index, value) {
                    time.push(Date(value.ftime));
                    windSpeed.push(parseInt(value.F));
                    rain.push(parseInt(value.R));
                    heat.push(parseInt(value.T));
                    dM.push(parseInt(value.TD));                    
                });
            }
        });

        var weatherStats = [{
            "WindSpeed": {
                "values": windSpeed
            },
        }, {
            "Rain": {
                "values": rain
            }

        }
            , {
            "Heat": {
                "values": heat
            }

        }
            , {
            "Dew point": {
                "values": dM
            }

        }];
        weatherInfo.push(weatherStats, location, atime, time, cleanResult);
        return weatherInfo;
    }
    
    //create the graph using highcharts
    function createGraph(data) {
        
        //data formating
        var currentDate = new Date(data[2]);
        var dateForGraph = data[2].split('-');
        var day = dateForGraph[2].split(' ')[0];
        var h = dateForGraph[2].split(' ')[1];
        var hour = h.split(':')[0];
        
        var options = {
            chart: {
                renderTo: 'container'
            },
            title: {
                text: "Weather for " + data[1] + " from " + currentDate.toISOString().split('T')[0]
            },
            xAxis: {
                type: 'datetime',

            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },

            plotOptions: {
                series: {

                    pointStart: Date.UTC(parseInt(dateForGraph[0]), parseInt(dateForGraph[1]) - 1, parseInt(dateForGraph[2].split(' ')[0]), hour),
                    pointInterval: 1 * 3600 * 1000

                }
            },
            series: [],
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }
        }
        
        //feed highcharts data for lines in graph
        var index = 0;
        data[0].forEach(element => {
            options.series.push({});
            options.series[index].name = Object.keys(element);
            options.series[index].data = element[Object.keys(element)].values;
            index++;
        })
        var chart = new Highcharts.Chart(options);
    }

    //generates table for HTML
    function createTable(data) {
        var tableRows = $(".table thead");
        var forecasts = data[4][0].forecast;
        var html = '';

        html += "<tr>";
        for (var k in forecasts[0]) {
            html += '<th>' + k + '</th>';
        }
        html += "</tr>";
        for (var i = 0; i < forecasts.length; i++) {
            html += '<tr>';
            for (var key in forecasts[i]) {
                html += '<td id=\'' + key + '\'>' + forecasts[i][key] + '</td>';
            }
            html += "</tr>";
        }
        tableRows.html(html);
        
        var tStats = $("#stats");
        statHtml = '';
        statHtml += '<tr><td>Category</td><td>Sum</td><td>Max</td><td>Min</td><td>Avg</td></tr>';
   
        for (var k in forecasts[0]) {
            if(k != 'ftime' && k != 'D' && k != 'W'){
                getLowAndHigh(k);
                statHtml += '<tr>';
                statHtml += '<td>'+k+'</td>';
                statHtml += "<td>"+getTableSum(k)+"</td>";
                statHtml += "<td>"+getTableMax(k)+"</td>";
                statHtml += "<td>"+getTableMin(k)+"</td>";
                statHtml += "<td>"+getTableAvg(k)+"</td>";
                statHtml += '</tr>';
            }
        }
        tStats.html(statHtml);
    }
    
    var weather = getWeatherInfo(1);
    createGraph(weather);
    createTable(weather);

    //switch station
    $("#stations").on('click', '*', function (e) {
        $(".table thead").html("");
        $("#stats").html("");
        var weather = getWeatherInfo(e.target.name);
        createGraph(weather);
        createTable(weather);
    });

    //highlighting lowest and highest values in table
    function getLowAndHigh(id){
        var $td = $('.table #'+id);
        var max = 0;
        var low = 100000;
        $.each($td, function () {
            if (parseInt($(this).text()) > max) {
                max = parseInt($(this).text());
            }
            if (parseFloat($(this).text()) < low) {
                low = parseInt($(this).text());
            }
            
        });
        $.each($td, function () {
            if (parseInt($(this).text()) == max) {
                $(this).css('background-color','rgb(255, 80, 80)');
                $(this).css('border-radius','12%');
            }
            if (parseFloat($(this).text()) == low) {
                $(this).css('background-color','rgb(102, 204, 255)');
                $(this).css('border-radius','12%');
            }
        });
    }

    //stats for bottom table
    function getTableSum(id){
        var $td = $('.table #'+id);
        var sum = 0;
        $.each($td, function () { 
            sum+=parseInt($(this).text()); 
        });
        return sum;
 
    }
    function getTableMax(id){
        var $td = $('.table #'+id);
        var max = 0;
        $.each($td, function () {
            if (parseInt($(this).text()) > max) {
                max = parseInt($(this).text());
            }
        });
        return max;
    }
    function getTableMin(id){
        var $td = $('.table #'+id);
        var low = 10000;
        $.each($td, function () {
            if (parseFloat($(this).text()) < low) {
                low = parseInt($(this).text());
            }
        });
        return low;
        
    }
    function getTableAvg(id){
        var $td = $('.table #'+id);
        var count = 0;
        var sum = 0;
        $.each($td, function () {
            
            sum+=parseInt($(this).text()); 
            count++;
        });
        return sum/count;
        
    }
});
