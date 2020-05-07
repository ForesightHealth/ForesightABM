import React, { Fragment } from 'react';
import Collapse, { Panel } from 'rc-collapse';

import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Dropzone from 'react-dropzone';

import Papa from 'papaparse';

import { downloadFile, POLICY_OPTIONS, COLORS } from './utils'; 
import Results from './components/Results';

import './App.css';
import 'rc-collapse/assets/index.css';


const CURRENCY_FORMAT = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const DECIMAL_FORMAT = new Intl.NumberFormat('en-US', { style: 'decimal'});

export default class App extends React.Component {
  constructor(props) {
    super(props);


    this.state = {
      runs: [],
      toggled: [],
      filters: [ ],
    }

    this.fields = {};
  }

  setRefFn(id) {
    return (element) => this.fields[id] = element;
  } 

  getValue(field) {
    switch(field.type) {
      case 'text':
      case 'number':
        return field.value;
      case 'checkbox':
        return field.checked;
      default:
        throw new Error(`unexpected field type: ${field.type} -- ${field}`);
    }
  }

  handleStartSimulationClick = (e) => {
    console.dir(this.state.runs)
    const newRunSettings = {
      id: Math.max(...this.state.runs.map(r => r.id), -1) + 1 // starts with 0 and increments by 1 each time
    };
    for (const fieldName in this.fields) {
      const field = this.fields[fieldName];
      newRunSettings[fieldName] = this.getValue(field);
    }

    newRunSettings.Label = newRunSettings.Label || `Simulation ${newRunSettings.id + 1}`;
    newRunSettings.color = COLORS[newRunSettings.id];

    this.startSimulation(newRunSettings);
    document.getElementById('new_simulation_form').reset();
  }

  startSimulation = (newRunSettings) => {
    const newRun = {
      ...newRunSettings
    };

    const simulationParams = { NumPatients: 1000 };

    for (const label in POLICY_OPTIONS) {
      const fieldSettings = POLICY_OPTIONS[label];
      if (!fieldSettings.exportName) continue;

      let exportValue = newRunSettings[label];

      if (fieldSettings.exportFn) {
        exportValue = fieldSettings.exportFn(exportValue);
      }

      simulationParams[fieldSettings.exportName] = exportValue;
    }

    // TODO make this url configurable
    fetch('http://localhost:5000/run_simulation', {
      method: 'POST',
      body: JSON.stringify(simulationParams, null, 2)
    })
    .then(response => response.json())
    .then(results => {
      newRun.results = this.postProcessResults(results);
      this.setState({ runs: this.state.runs })
    });

    this.setState({ runs: [...this.state.runs, newRun], toggled: [...this.state.toggled, true] });
  }

  postProcessResults = (results) => {
    console.log("results");
    console.dir(results);
    results.patients.forEach((p,i) => p['Patient ID'] = i);
    
    const toObj = array => ({ raw: array[0], estimate: array[1] });

    // TODO: the data models can still be cleaned up a little better
    for (const key in results.runSummary) {
      const values = results.runSummary[key];
      if (!Array.isArray(values)) continue;
      if (values.length === 1) {
        results.runSummary[key] = values[0];
      } else if (values.length === 2) {
        results.runSummary[key] = toObj(values);
      }
    }
    console.log("after processing")
    console.dir(results)
    return results;
  }

  deleteRun = (i) => {
    return (e) => {
      const runs = this.state.runs;
      runs.splice(i, 1);
      const toggled = this.state.toggled;
      toggled.splice(i, 1);
      this.setState({ runs, toggled });
      e.stopPropagation();
    }
  }

  toggleRun = key => {
    return e => {
      console.log(key);
      const toggled = this.state.toggled;
      toggled[key] = !toggled[key];
      this.setState({ toggled });
      e.stopPropagation();
    };
  }

  downloadButton = (run) => {
    const output = {};

    for (const label in POLICY_OPTIONS) {
      const fieldSettings = POLICY_OPTIONS[label];
      if (!fieldSettings.exportName) continue;

      let exportValue = run[label];

      if (fieldSettings.exportFn) {
        exportValue = fieldSettings.exportFn(exportValue);
      }

      output[fieldSettings.exportName] = exportValue;
    }

    const fileContent = JSON.stringify(output, null, 2);
    downloadFile(fileContent, 'policy.json');
  }

  processCSV(file) {
    const lines = file.split(/\r?\n/);

    const firstSegment = lines.slice(0, 8);

    const runSummary = {};
    firstSegment.forEach(line => {
      const pieces = line.split(',');
      const key = pieces[0];
      const raw = pieces[1];
      const estimate = pieces[2]; // may be undefined

      runSummary[key] = { raw, estimate };
    });

    const csv = lines.slice(8).join('\n');

    const results = Papa.parse(csv, { 
      header: true, 
      skipEmptyLines: 'greedy',
      transformHeader: header => header.toLowerCase()
     });

    return { runSummary, patients: results.data };
  }

  onDrop(run) {
    return (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();

        reader.onload = () => {
          const textStr = reader.result;

          run['results'] = file.path.endsWith('.csv') ? this.processCSV(textStr) : JSON.parse(textStr);
          this.setState({ runs: this.state.runs });
        }
        reader.readAsText(file);
      })
    }
  }

  formatRunSummaryLine(key, values) {
    let value;
    switch (typeof values) {
      case 'object':
        value = Number(values.raw);
        break;
      case 'number':
        value = values;
        break;
      case 'string':
        value = Number(values);
        break;
      default:
        console.error(`unexpected value in formatRunSummaryLine: ${values}`);
        return null;
    }
    const formatter = Number.isInteger(value) ? DECIMAL_FORMAT : CURRENCY_FORMAT;
    return (
      <div>
        <b>{key}</b> {formatter.format(value)}
        { values.estimate && (<div>Full Population Estimate: { formatter.format(values.estimate) }</div>)}
      </div>);
  }

  renderRunSummary(run) {
    const lines = [];

    for (const key in run.results.runSummary) {
      lines.push(this.formatRunSummaryLine(key, run.results.runSummary[key]));
    }
    return (
      <Fragment>
        <hr />
        <h4>Summary of Results</h4>
        <ul>
          <li key={0}>{ this.formatRunSummaryLine('Population Size', { raw: run.results.patients.length }) }</li>
        { lines.map((l,i) => <li key={i}>{l}</li>) }
        </ul>
      </Fragment>);
  }

  renderRuns() {
    return this.state.runs.map((run,i) => (
      <Panel 
        header={run.Label} 
        extra={<div>{run.results ? <input type="checkbox" className="largerCheckbox" defaultChecked="true" onClick={this.toggleRun(run.id)} /> : <img src="loading.gif" alt="Loading..." style={{height: '20px'}} />}&nbsp;<Button variant="outline-danger" size="sm" onClick={this.deleteRun(i)}>x</Button></div>} 
        key={i+1}> {/* note this is i+1 because key 0 is the "new sim" */}
        <ul>
         { this.renderPolicyOptions(run) }
        </ul>
        { !run.results && <Button variant="outline-primary" onClick={() => this.downloadButton(run)}>Download Policy File</Button> }
        { !run.results && <Dropzone onDrop={this.onDrop(run)} >
          {({getRootProps, getInputProps}) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Upload Result File Here</p>
            </div>
          )}
        </Dropzone> }
        { run.results && this.renderRunSummary(run) }
      </Panel>
      )
    );
  }

  renderPolicyOptions(run = null) {
    const options = [];
    for (const label in POLICY_OPTIONS) {
      const fieldSettings = POLICY_OPTIONS[label];
      const value = run && run[label];
      let element;

      switch (fieldSettings.type) {
        case 'text':
          element = <input type="text" defaultValue={value || ''} disabled={!!run} ref={!run && this.setRefFn(label)} />;
          break;

        case 'boolean':
          element = <input type="checkbox" checked={value} disabled={!!run} ref={!run && this.setRefFn(label)} />;
          break;

        case 'number':
          element = <input type="number" className="numberField" min={fieldSettings.min} max={fieldSettings.max} defaultValue={value || fieldSettings.defaultValue} disabled={!!run} ref={!run && this.setRefFn(label)} />
          break;

        default:
          continue; // do nothing
      }

      options.push({
        label,
        element
      });
    }

    return options.map((o,i) => <li key={i}>{o.label}: {o.element}</li>)
  }

  toggleFilters = selectedOptions => {
    this.setState({ filters: selectedOptions });
  }

  render() {
    return (
      <Fragment>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="#">
            <b>HPT | Health Policy Testbed</b>
          </Navbar.Brand>
        </Navbar>
        <Container fluid={true}>
          <Row>
            <Col sm={3}>
             { /* data chooser */ }
               <Collapse defaultActiveKey="0">
                 <Panel header="New Simulation">
                   <form action="" method="get" id="new_simulation_form">
                    { /* <select>
                       <option></option>
                       <option>Sanders Plan</option>
                       <option>Warren Plan</option>
                       <option>Custom</option>
                     </select>
                     <br/><br/> */ }
                     <ul>
                      { this.renderPolicyOptions() }
                     </ul>
                   </form>
                   <Button variant="outline-primary" onClick={this.handleStartSimulationClick}>
                     Run Simulation
                   </Button>
                 </Panel>
                 { this.renderRuns() }
               </Collapse>
            </Col>
            <Col sm={9}>
              <div className="boxed no-top">
                <Results runs={this.state.runs} toggled={this.state.toggled} />
              </div>
            </Col>
          </Row>
        </Container>
      </Fragment>
    );
  }
};
