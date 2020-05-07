const diabetesChart  = {
    chart: {
      type: 'column'
    },
    title: {
      text: '',
      floating: true
    },
    xAxis: {
      labels: { style: { fontSize: '16px' } },
      categories: ['Diabetes', 'Diagnosed', 'Controlled'],
      crosshair: true
    },
    yAxis: {
      min: 0,
      valueSuffix: ' %',
      labels: { 
        style: { fontSize: '16px' },
        formatter: function () {
              return Math.abs(this.value) + '%';
          }
      },
      title: {
        text: '% of Sub-population'
      }
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b> {point.y:.1f}% </b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        // borderWidth: 0,
        borderColor: '#303030'
      },
      series: {
          borderColor: '#303030'
      }
    },
    series: []
  };

  export default diabetesChart;