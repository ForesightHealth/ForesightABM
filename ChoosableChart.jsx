import React, { useState, useEffect } from 'react';
import { Chart } from '../utils'; 

const ChoosableChart = (props) => {
  const chartOptions = JSON.parse(JSON.stringify(props.options)); // simple dup to prevent stomping on the object
  const defaultLabel = chartOptions.series.length > 0 ? chartOptions.series[0].label : null
  const [label, setLabel] = useState(defaultLabel);

  useEffect(() => setLabel(defaultLabel), [defaultLabel]);

  let selection;
  if (chartOptions.series.length > 1) {
    const choices = [...new Set( chartOptions.series.map(s => s.label) )];

    chartOptions.series = chartOptions.series.filter(s => !label || s.label === label); // keep only the selected label, if one is selected
    selection = ( <select onChange={ e => setLabel(e.target.value) }> { choices.map(c => <option key={c}>{c}</option>) } </select> );
  } else if (chartOptions.series.length === 1) {
    selection = chartOptions.series[0].label;
  } else {
    selection = label || '';
  }

  return (
        <div className="boxed" style={{'textAlign': 'center'}} >
        <span className="highcharts-title"><b>{props.title}</b><br/>{ selection }</span>
          <Chart options={chartOptions} />
        </div>
    );
}

export default ChoosableChart;