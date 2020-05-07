import React, { useState } from 'react';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import { Chart, filterOptions, parseBoolean, getUncontrolledDiabetesPrevalence } from '../utils'; 

import SingleRunResults from './SingleRunResults';
import ChoosableChart from './ChoosableChart';

import Select from 'react-select';

const USE_MULTI_SELECT = true;


const Results = (props) => {

  const [filters, setFilters] = useState([]);

  const costsChart  = {
    chart: {
      type: 'column'
    },
    title: {
      text: '',
      floating: true
    },
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

    // const chartMapping = [
    //   { key: 'Avoidable_Mortality', label: 'Avoidable Mortality', chart: healthOutcomesChart },
    //   { key: 'Preventable_Morbidity', label: 'Preventable Morbidity', chart: healthOutcomesChart },
    //   { key: 'Avoidable_Mortality', label: 'Diabetes Diagnosis %', chart: healthOutcomesChart },
    //   { key: 'Preventable_Morbidity', label: 'Diabetes Controlled %', chart: healthOutcomesChart },

    //   // { key: 'MedicalExpCost', label: 'Medical Expenditures', chart: costsChart },
    // ];

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

    const runsToShow = props.runs.filter((r, i) => r.results && props.toggled[i]);

    runsToShow.forEach((run,i) => {
      let patients = run.results.patients.slice();
      let filterLabel = null;
      if (Array.isArray(filters)) {
        for (const filter of filters) {
          patients = patients.filter(filter.filter);
          filterLabel = filterLabel ? filterLabel + ', ' + filter.label : filter.label;
        }
      } //else if (filters && typeof filters === 'object') { // when react-select is multi=false
       // const patients = patients.filter(filters.filter);
       // filterLabel = filters.label;
      //}

      filterLabel = filterLabel || 'All';

      // for (const dataSet of chartMapping) {
      //   const key = dataSet.key
      //   const rawData = patients.map(p => [parseFloat(p[`${key}_Yr1`]), parseFloat(p[`${key}_Yr3`]), parseFloat(p[`${key}_Yr5`])]);
      //   const sums = [0,0,0];
      //   rawData.forEach(row => { sums[0] += row[0]; sums[1] += row[1]; sums[2] += row[2]; }); 
      //   const data = sums.map(i => i / rawData.length);

      //   dataSet.chart.series.push({ name: run.Label + ': ' + filterLabel, data: data, color: run.color, label: dataSet.label });
      // }

      const rawData = patients.map(p => [parseBoolean(p['diabetes']), parseBoolean(p['diagnosed']), parseBoolean(p['controlled'])]);
      const sums = [0,0,0];
      rawData.forEach(row => { sums[0] += row[0] ? 1 : 0; sums[1] += row[1] ? 1 : 0; sums[2] += row[2] ? 1 : 0; }); 
      const data = sums.map(i => 100.0 * i / rawData.length);
      diabetesChart.series.push({ name: run.Label + ': ' + filterLabel, data: data, color: run.color });

      const runSummary = run.results.runSummary;
      const medicareCosts = runSummary['Medicare Funds:'];
      const medicaidCosts = runSummary['Medicaid Funds:'];

      costsChart.series.push({ name: run.Label, data: [parseInt(medicareCosts.estimate), parseInt(medicaidCosts.estimate)], color: run.color, label: 'Full Pop Estimates' });
      costsChart.series.push({ name: run.Label, data: [parseFloat(medicareCosts.raw), parseFloat(medicaidCosts.raw)], color: run.color, label: 'Raw Numbers' });


      const countMedicare = runSummary['Number on Medicare:'];
      const countMedicaid = runSummary['Number on Medicaid:'];
      const countPrivate = runSummary['Number on Private Insurance:'];
      const countUninsured = runSummary['Number of Uninsured:'];

      coverageChart.series.push({ name: run.Label, data: [parseFloat(countMedicare.estimate), parseFloat(countMedicaid.estimate), parseFloat(countPrivate.estimate), parseFloat(countUninsured.estimate)], color: run.color, label: 'Full Pop Estimates' });
      coverageChart.series.push({ name: run.Label, data: [parseFloat(countMedicare.raw), parseFloat(countMedicaid.raw), parseFloat(countPrivate.raw), parseFloat(countUninsured.raw)], color: run.color, label: 'Raw Numbers' });

      // disparities calculations
      const overallPrevalence = getUncontrolledDiabetesPrevalence(run.results.patients); 
      disparitiesChart.series.push({ name: run.Label + ' Overall', data: [[overallPrevalence, overallPrevalence]], color: run.color, showInLegend: false });

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

      debugger; 
      const nhwHeHighIncome = nhwHighEducation.filter(patient => Number(patient['income']) >= 100000);
      const nhbLeLowIncome = nhbLowEducation.filter(patient => Number(patient['income']) < 50000);

      const nhwPct = getUncontrolledDiabetesPrevalence(nonHispanicWhite);
      const nhbPct = getUncontrolledDiabetesPrevalence(nonHispanicBlack);
      const nhwHePct = getUncontrolledDiabetesPrevalence(nhwHighEducation);
      const nhbLePct = getUncontrolledDiabetesPrevalence(nhbLowEducation);
      const nhwHeHiPct = getUncontrolledDiabetesPrevalence(nhwHeHighIncome);
      const nhbLeLiPct = getUncontrolledDiabetesPrevalence(nhbLeLowIncome);

      disparitiesChart.series.push({ name: run.Label, data: [null, [nhwPct, nhbPct], [nhwHePct, nhbLePct], [nhwHeHiPct, nhbLeLiPct]], color: run.color, lowColor: leftColor, marker: { fillColor: rightColor } });
      
    });

    return (
      <div>
        <Tabs forceRenderTabPanel={true}>
          <TabList>
            { runsToShow.length === 0 && <Tab key="Introduction">Introduction</Tab>}
            { runsToShow.map(run => <Tab key={run.Label}>{run.Label}</Tab>) }
            { runsToShow.length > 1 && <Tab key="Compare">Compare</Tab> }
          </TabList>

          { runsToShow.length === 0 && <TabPanel key="Introduction">Select some policy levers on the left and click <strong>Run Simulation</strong>. Results will appear here.</TabPanel>}

          { runsToShow.map(run => <TabPanel key={run.Label}><SingleRunResults run={run} /></TabPanel>) }

          { runsToShow.length > 1 &&        
          <TabPanel key="Compare">
            <Tabs forceRenderTabPanel={true} >
              <TabList>
                <Tab>Population Health</Tab>
                <Tab>Disparities</Tab>
                <Tab>Costs</Tab>
                <Tab>Coverage</Tab>
              </TabList>

              <TabPanel>
                <div className="boxed" style={{'textAlign': 'center'}} >
                  <span className="highcharts-title"><b>Population Health</b></span>
                  <Chart options={diabetesChart} />
                </div>
                <div className="boxed">
                  <Select isMulti={USE_MULTI_SELECT} placeholder="All Patients" options={filterOptions} closeMenuOnSelect={!USE_MULTI_SELECT} onChange={ s => setFilters(s) } value={filters} />
                </div>
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
            </Tabs>
          </TabPanel>
        }
        </Tabs>
      </div>);
};

export default Results;