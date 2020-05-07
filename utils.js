import React from 'react'

import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

require('highcharts/highcharts-more')(Highcharts);
require('highcharts/modules/dumbbell')(Highcharts);
require('highcharts/modules/histogram-bellcurve')(Highcharts);

// hack to make the dumbbell legend icons nicer
// Highcharts.seriesTypes.dumbbell.prototype.drawLegendSymbol = Highcharts.seriesTypes.spline.prototype.drawLegendSymbol;

Highcharts.setOptions({
    lang: {
        thousandsSep: ',',
        numericSymbols: [' k', ' M', ' B', ' T']
    }
});

const Chart = (props) =>
                  <HighchartsReact 
                    highcharts={Highcharts}
                    options={props.options}
                  />;


const downloadFile = (data, filename) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  // the filename you want
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
};


 let index = 1;
    const filterOptions = [
      { label: 'All', value: index++, filter: () => true },

      { label: 'Race/Ethnicity: Non-Hispanic White', value: index++, filter: patient => patient['ethnicity'] === 'Non-Hispanic White' },
      { label: 'Race/Ethnicity: Non-Hispanic Black', value: index++, filter: patient => patient['ethnicity'] === 'Non-Hispanic Black' },
      { label: 'Race/Ethnicity: Non-Hispanic Asian', value: index++, filter: patient => patient['ethnicity'] === 'Non-Hispanic Asian' },
      { label: 'Race/Ethnicity: Mexican American', value: index++, filter: patient => patient['ethnicity'] === 'Mexican American' },
      { label: 'Race/Ethnicity: Other Hispanic', value: index++, filter: patient => patient['ethnicity'] === 'Other Hispanic' },
      // { label: 'Ethnicity: Hispanic', value: index++, filter: patient => ??? },

      { label: 'Gender: Male', value: index++, filter: patient => patient['gender'] === 'Male' },
      { label: 'Gender: Female', value: index++, filter: patient => patient['gender'] === 'Female' },

      // { label: 'Urban', value: index++, filter: patient => patient['Urban vs Rural'] === 'Urban' },
      // { label: 'Rural', value: index++, filter: patient => patient['Urban vs Rural'] === 'Rural' }

      { label: 'Income: < 50k', value: index++, filter: patient => Number(patient['income']) < 50000 },
      { label: 'Income: 50k - 100k', value: index++, filter: patient => Number(patient['income']) >= 50000 && Number(patient['income']) < 100000 },
      { label: 'Income: > 100k', value: index++, filter: patient => Number(patient['income']) >= 100000 },

       // High School Diploma or Equivalent , 

      { label: 'Education: High School Diploma or Equivalent', value: index++, filter: patient => patient['education'] === 'High School Diploma or Equivalent' },
      // { label: 'Education: Medium', value: index++, filter: () => true },
      // { label: 'Education: High', value: index++, filter: () => true },

      { label: 'Age >= 65', value: index++, filter: patient => patient['age'] >- 65 },

      { label: 'Has Diabetes', value: index++, filter: patient => patient['diabetes'].toLowerCase() === 'true' },
      { label: 'Diagnosed Diabetes', value: index++, filter: patient => patient['diagnosed'].toLowerCase() === 'true' },
      { label: 'Controlled Diabetes', value: index++, filter: patient => patient['controlled'].toLowerCase() === 'true' },

    ]; 

// Add new policy options here.
// format:
// 'Human Friendly Name on UI': {
//   type: 'number', 'text', or 'boolean'
//   min: minimum, if number
//   max: maximum, if number
//   defaultValue: default value for the field
//   exportName: property name to send to the model
//   exportFn: function to convert the display value to the export value. for some reason numbers all need to be converted to Numbers
// }
const POLICY_OPTIONS = {
  'Label': { type: 'text' },
  // 'Universality': { type: 'boolean' },
  // 'Premiums': { type: 'boolean', exportName: 'SampleExportNameHere' },
  'Medicare Age of Eligibility' : { type: 'number', min: 26, max: 75, defaultValue: 65, exportName: 'MedicareAge', exportFn: v => Number(v)},
  'Medicaid FPL%' : { type: 'number', min: 0, max: 500, defaultValue: 138, exportName: 'MedicaidIncomeElig', exportFn: v => v / 100 },
  'Low-Income Education Assistance' : { type: 'boolean', exportName: 'EducationOverride' },
  'Education Assistance FPL% Qualification' : { type: 'number', min: 0, max: 500, defaultValue: 0, exportName: 'EducationOverrideQual', exportFn: v => v / 100 },
  'Population Size' : { type: 'number', min: 1, defaultValue: 10000, exportName: 'NumPatients', exportFn: v => Number(v) }
};

// https://sashat.me/2017/01/11/list-of-20-simple-distinct-colors/
// const COLORS = ['#e6194b', '#4363d8', '#3cb44b', '#ffe119', '#f58231', 
//                 '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
//                 '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', 
//                 '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'];

const COLORS = ['#469990', '#4363d8', '#000075', '#42d4f4', '#3cb44b', '#aaffc3'];

const blend = (color1, color2, alpha) => {
  return [
          color1[0]+(color2[0]-color1[0])*alpha, 
          color1[1]+(color2[1]-color1[1])*alpha,
          color1[2]+(color2[2]-color1[2])*alpha
         ];
}

const toColorArray = (rgb) => {
  const index = rgb.startsWith('#') ? 1 : 0;

  const r = rgb.slice(index    , index + 2);
  const g = rgb.slice(index + 2, index + 4);
  const b = rgb.slice(index + 4, index + 6);

  return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)]
};

const toRgb = (colorArray, useHash=true) => {

  return `#${colorArray.map(x => (x < 16 ? '0' : '') + Math.floor(x).toString(16)).join('')}`;
}

  const black = [0,0,0];
  const white = [255, 255, 255];

const monochromePalette = (rgb, numColors) => {
  if (numColors === 1) return [rgb];

  const color = toColorArray(rgb);

  // const points = [-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100]; 

  const points = [0, 80, -80, 60, -60, 40, -40 ]; // ordered to produce reasonable color schemes

  const colorScheme = points.map(p => blend(color, p < 0 ? white : black, Math.abs(p) / 100));

  return colorScheme.slice(0, numColors).map(toRgb);
};

const getUncontrolledDiabetesPrevalence = patients => {
  const diabetesPatients = patients.filter(p => parseBoolean(p['diabetes']));
  const diagnosedPatients = diabetesPatients.filter(p => parseBoolean(p['diagnosed']));
  const controlledPatients = diagnosedPatients.filter(p => parseBoolean(p['controlled']));

  return 100.0 * (diagnosedPatients.length - controlledPatients.length) / patients.length;
}


const parseBoolean = (str) => typeof str === 'boolean' ? str : str.toLowerCase() === 'true';

export {
  Chart,
  downloadFile,
  monochromePalette,
  POLICY_OPTIONS, COLORS, filterOptions, getUncontrolledDiabetesPrevalence, parseBoolean
};