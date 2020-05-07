export const disparitiesChart = {
          chart: {
            type: 'dumbbell',
            inverted: true
        },

          title: {
            text: '',
            floating: true
          },

        yAxis: {
            // min: 0,
            style: { fontSize: '16px' },
            title: {
                text: '% of Sub-Population'
            }
        },
        xAxis: [{
            labels: { style: { fontSize: '16px' } },
            categories: ['Overall', 'Non-Hispanic White', 'Non-Hispanic White<br/>Education >= College', 'Non-Hispanic White<br/>Education >= College<br/>High Income']
        }, { // mirror axis on right side
            labels: { style: { fontSize: '16px' } },
            opposite: true,
            reversed: false,
            categories: ['Overall', 'Non-Hispanic Black', 'Non-Hispanic Black<br/>Education < College', 'Non-Hispanic Black<br/>Education < College<br/>Low Income'],
            linkedTo: 0
        }],
        plotOptions: {
          series: {
            connectorWidth: 3,
            pointPadding: 1,
            enableMouseTracking: false, // there seems to be a bug with colors -- hover resets the fillColor to the series color
            dataLabels: {
              enabled: true,
              format: '{point.y:.1f}%'
            },
            marker: {
                radius: 8
            }
          }
        },

        series: [
        { name: 'Non-Hispanic White', color: leftColor }, // fake series for the 2 edge colors to appear in the legend
        { name: 'Non-Hispanic Black', color: rightColor }
        // ,
        // {
        //     data: [null, [2.3, 6.5], [1.6, 6.5], [2.1, 6.3]]
        // }, {
        //     data: [null, [1.8, 6.0], [1.3, 6.5], [1.5, 5.0]]
        // }
        ]
    };



    export const leftColor = '#dcedc8'
    export const rightColor = '#1a237e'