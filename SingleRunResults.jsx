import React, { useState } from 'react';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import ReactDataGrid from 'react-data-grid';

import { Chart, monochromePalette, filterOptions, getUncontrolledDiabetesPrevalence, parseBoolean } from '../utils'; 

import ChoosableChart from './ChoosableChart';

import Select from 'react-select';


const USE_MULTI_SELECT = true;

const SingleRunResults = (props) => {
  const run = props.run;

  const [filters, setFilters] = useState([filterOptions[0]]);

      const diabetesChart  = {
      chart: {
        type: 'column'
      },
      title: {
        text: '',
        floating: true
      },
      // title: {
      //   text: 'Population Health'
      // },
      // subtitle: {
      //   text: 'costs or something'
      // },
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
          // borderWidth: 0
        },
        series: {
            borderColor: '#303030',
            // borderWidth: 2
        }
      },
      series: []
    };

      const costsChart  = {
      chart: {
        type: 'column'
      },
      title: {
        text: '',
        floating: true
      },
      // title: {
      //   text: 'Costs'
      // },
      // subtitle: {
      //   text: 'costs or something'
      // },
      xAxis: {
        labels: { style: { fontSize: '16px' } },
        categories: ['Medicare Costs', 'Medicaid Costs'],
        crosshair: true
      },
      yAxis: {
        min: 0,
        labels: { style: { fontSize: '16px' } },
        title: {
          text: '$'
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b> $ {point.y} </b></td></tr>',
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

      const coverageChart  = {
      chart: {
        type: 'column'
      },
      title: {
        text: '',
        floating: true
      },
      // title: {
      //   text: 'Coverage'
      // },
      // subtitle: {
      //   text: 'costs or something'
      // },
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


    const leftColor = '#dcedc8';
    const rightColor = '#1a237e';

    const disparitiesChart = {
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
            linkedTo: 0,
            // labels: {
            //     step: 1
            // }
        }],
        plotOptions: {
          series: {
            pointPadding: 1,
            connectorWidth: 3,
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
        // {
        //     name: 'Overall Prevalence',
        //     color: '#7f7fff', 
        //     data: null // [[4.6, 4.6]]
        // },
        { name: 'Non-Hispanic White', color: leftColor }, // fake series for the 2 edge colors to appear in the legend
        { name: 'Non-Hispanic Black', color: rightColor }
        // {
        //     color: run.color,
        //     data: null // [null, [2.3, 6.5], [1.6, 6.5], [2.1, 6.3]]
        // }
        ]

    };

    if (filters) {
      const colors = monochromePalette(run.color, filters.length); // ['#00429d', '#416db1', '#629cc4', '#7dccd7', '#fca89e', '#e2616e', '#bd284d', '#93003a'];

      filters.forEach( (filter, i) =>  {
        const patients = run.results.patients.filter(filter.filter);
        const rawData = patients.map(p => [parseBoolean(p['diabetes']), parseBoolean(p['diagnosed']), parseBoolean(p['controlled'])]);
        const sums = [0,0,0];
        rawData.forEach(row => { sums[0] += row[0] ? 1 : 0; sums[1] += row[1] ? 1 : 0; sums[2] += row[2] ? 1 : 0; }); 
        const data = sums.map(i => 100.0 * i / rawData.length);
        diabetesChart.series.push({ name: filter.label, data: data, color: colors[i % colors.length] /* run.color */, label: filter.label });
      });
    }

    const runSummary = run.results.runSummary;
    const medicareCosts = runSummary['Medicare Funds:'];
    const medicaidCosts = runSummary['Medicaid Funds:'];

    costsChart.series.push({ name: 'All', data: [parseInt(medicareCosts.estimate), parseInt(medicaidCosts.estimate)], color: run.color, label: 'Full Pop Estimates' });
    costsChart.series.push({ name: 'All', data: [parseFloat(medicareCosts.raw), parseFloat(medicaidCosts.raw)], color: run.color, label: 'Raw Numbers' });


    const countMedicare = runSummary['Number on Medicare:'];
    const countMedicaid = runSummary['Number on Medicaid:'];
    const countPrivate = runSummary['Number on Private Insurance:'];
    const countUninsured = runSummary['Number of Uninsured:'];

    coverageChart.series.push({ name: 'All', data: [parseFloat(countMedicare.estimate), parseFloat(countMedicaid.estimate), parseFloat(countPrivate.estimate), parseFloat(countUninsured.estimate)], color: run.color, label: 'Full Pop Estimates' });
    coverageChart.series.push({ name: 'All', data: [parseFloat(countMedicare.raw), parseFloat(countMedicaid.raw), parseFloat(countPrivate.raw), parseFloat(countUninsured.raw)], color: run.color, label: 'Raw Numbers' });


    // disparities calculations
    const overallPrevalence = getUncontrolledDiabetesPrevalence(run.results.patients); 
    console.log(overallPrevalence);
    // disparitiesChart.series[0].data = [[overallPrevalence, overallPrevalence]];

    // layout 
    // overall      *   overall
    // filter A   <---> filter B
    // filter AC  <---> filter BD
    // filter ACE <---> filter BDF
    //
    // turns into [null, [A, B], [AC, BD], [ACE, BDF]]

    const nonHispanicWhite = run.results.patients.filter(patient => patient['ethnicity'] === 'Non-Hispanic White');
    const nonHispanicBlack = run.results.patients.filter(patient => patient['ethnicity'] === 'Non-Hispanic Black');

    const nhwHighEducation = nonHispanicWhite.filter(patient => patient['gender'] === 'Male'); // TODO
    const nhbLowEducation = nonHispanicBlack.filter(patient => patient['gender'] === 'Female'); // TODO

    const nhwHeHighIncome = nhwHighEducation.filter(patient => Number(patient['income']) >= 100000);
    const nhbLeLowIncome = nhbLowEducation.filter(patient => Number(patient['income']) < 50000);


    const nhwPct = getUncontrolledDiabetesPrevalence(nonHispanicWhite);
    const nhbPct = getUncontrolledDiabetesPrevalence(nonHispanicBlack);

    const nhwHePct = getUncontrolledDiabetesPrevalence(nhwHighEducation);
    const nhbLePct = getUncontrolledDiabetesPrevalence(nhbLowEducation);
    const nhwHeHiPct = getUncontrolledDiabetesPrevalence(nhwHeHighIncome);
    const nhbLeLiPct = getUncontrolledDiabetesPrevalence(nhbLeLowIncome);

    disparitiesChart.series.push({ name: run.Label, data: [[overallPrevalence, overallPrevalence], [nhwPct, nhbPct], [nhwHePct, nhbLePct], [nhwHeHiPct, nhbLeLiPct]], color: run.color, lowColor: leftColor, marker: { fillColor: rightColor } });



    const dataGridColumns = Object.keys(run.results.patients[0]).map(k => ({ key: k, name: k, resizable: true, sortable: true, filterable: true }));

const sortRows = (initialRows, sortColumn, sortDirection) => rows => {
  const comparer = (a, b) => {
    if (sortDirection === "ASC") {
      return a[sortColumn] > b[sortColumn] ? 1 : -1;
    } else if (sortDirection === "DESC") {
      return a[sortColumn] < b[sortColumn] ? 1 : -1;
    }
  };
  return sortDirection === "NONE" ? initialRows : [...rows].sort(comparer);
};

    const allPatients = run.results.patients.slice();
    allPatients.forEach(p => {
      // hack to convert all booleans to strings. for some reason the react data grid just shows an empty box for bools
      for (const property in p) {
        if (typeof p[property] === 'boolean') p[property] = p[property].toString();
      }
    });

    const [dataGridRows, setDataGridRows] = useState(allPatients);

  return (
    <div>
      <Tabs forceRenderTabPanel={false} >
        <TabList>
          <Tab>Population Health</Tab>
          <Tab>Disparities</Tab>
          <Tab>Costs</Tab>
          <Tab>Coverage</Tab>
          <Tab>View Patients</Tab>
        </TabList>

        <TabPanel>
          <div className="boxed" style={{'textAlign': 'center'}} >
            <span className="highcharts-title"><b>Population Health</b></span>
            <Chart options={diabetesChart} />
          </div>  
          <div className="boxed">
            <Select key={run.label} isMulti={USE_MULTI_SELECT} options={filterOptions} closeMenuOnSelect={!USE_MULTI_SELECT} onChange={ s => setFilters(s) } value={filters} />
          </div>  
             { /* <ChoosableChart title="Population Health" options={healthOutcomesChart} /> */ }
        </TabPanel>
        <TabPanel>
          <div className="boxed" style={{'textAlign': 'center'}} >
            <span className="highcharts-title"><b>Uncontrolled Diabetes</b></span>
            <Chart options={disparitiesChart} />
          </div>
        </TabPanel>
        <TabPanel>
          <ChoosableChart title="Costs" options={costsChart} />
        </TabPanel>
        <TabPanel>
          <ChoosableChart title="Coverage" options={coverageChart} />
        </TabPanel>

        <TabPanel>
          <ReactDataGrid
            columns={dataGridColumns}
            rowGetter={i => dataGridRows[i]}
            rowsCount={dataGridRows.length}
            onGridSort={(sortColumn, sortDirection) =>
              setDataGridRows(sortRows(dataGridRows, sortColumn, sortDirection))
            }
            minHeight={750} />
        </TabPanel>
      </Tabs>

    </div>
   );
};

export default SingleRunResults;