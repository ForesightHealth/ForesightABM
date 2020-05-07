const coverageChart  = {
    chart: {
      type: 'column'
    },
    title: {
      text: '',
      floating: true
    },
    xAxis: {
      labels: { style: { fontSize: '16px' } },
      categories: ['Medicare', 'Medicaid', 'Private Insurance', 'Uninsured'],
      crosshair: true
    },
    yAxis: {
      min: 0,
      labels: { style: { fontSize: '16px' } },
      title: {
        text: ''
      }
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b> {point.y} </b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        // borderWidth: 0
      },
      series: {
          borderColor: '#303030'
      }
    },
    series: []
  };
  export default coverageChart;