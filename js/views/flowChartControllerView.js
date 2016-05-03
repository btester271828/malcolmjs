/**
 * Created by twi18192 on 26/01/16.
 */

var React = require('react');
var ReactDOM = require('../../node_modules/react-dom/dist/react-dom.js');

var FlowChart = require('./flowChart');

var blockStore = require('../stores/blockStore.js');
var flowChartStore = require('../stores/flowChartStore');

function getFlowChartState(){
  return{
    /* blockStore */
    allBlockInfo: JSON.parse(JSON.stringify(blockStore.getAllBlockInfo())),


    /* flowChartStore */
    graphPosition: JSON.parse(JSON.stringify(flowChartStore.getGraphPosition())),
    graphZoomScale: JSON.parse(JSON.stringify(flowChartStore.getGraphZoomScale())),
    portThatHasBeenClicked: flowChartStore.getPortThatHasBeenClicked(),
    storingFirstPortClicked: flowChartStore.getStoringFirstPortClicked(),
    areAnyBlocksSelected: JSON.parse(JSON.stringify(flowChartStore.getIfAnyBlocksAreSelected())),
    areAnyEdgesSelected: JSON.parse(JSON.stringify(flowChartStore.getIfAnyEdgesAreSelected())),
    edgePreview: JSON.parse(JSON.stringify(flowChartStore.getEdgePreview())),
    blockStyling: JSON.parse(JSON.stringify(flowChartStore.getBlockStyling())),
    blockPositions: JSON.parse(JSON.stringify(blockStore.getBlockPositions())),
    //previousMouseCoordsOnZoom: JSON.parse(JSON.stringify(flowChartStore.getPreviousMouseCoordsOnZoom())),




    /* WebAPI use */

    testAllBlockInfo: JSON.parse(JSON.stringify(blockStore.getTestAllBlockInfo()))
  }
}

var FlowChartControllerView = React.createClass({

  getInitialState: function(){
    return getFlowChartState();
  },

  _onChange: function(){
    this.setState(getFlowChartState());
  },

  componentDidMount: function(){
    blockStore.addChangeListener(this._onChange);
    flowChartStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function(){
    blockStore.removeChangeListener(this._onChange);
    flowChartStore.removeChangeListener(this._onChange);
  },

  shouldComponentUpdate: function(nextProps, nextState){
    return (
      nextState.allBlockInfo !== this.state.allBlockInfo ||

      nextState.graphZoomScale !== this.state.graphZoomScale ||
      nextState.graphPosition.x !== this.state.graphPosition.x ||
      nextState.graphPosition.y !== this.state.graphPosition.y ||
      nextState.portThatHasBeenClicked !== this.state.portThatHasBeenClicked ||
      nextState.storingFirstPortClicked !== this.state.storingFirstPortClicked ||
      nextState.areAnyBlocksSelected !== this.state.areAnyBlocksSelected ||
      nextState.areAnyEdgesSelected !== this.state.areAnyEdgesSelected ||
      nextState.edgePreview !== this.state.edgePreview ||
      nextState.blockPositions !== this.state.blockPositions
    )
  },

  render: function(){
    return(
      <FlowChart
        allBlockInfo={this.state.allBlockInfo}

        graphZoomScale={this.state.graphZoomScale}
        graphPosition={this.state.graphPosition}
        portThatHasBeenClicked={this.state.portThatHasBeenClicked}
        storingFirstPortClicked={this.state.storingFirstPortClicked}
        areAnyBlocksSelected={this.state.areAnyBlocksSelected}
        areAnyEdgesSelected={this.state.areAnyEdgesSelected}
        edgePreview={this.state.edgePreview}
        //previousMouseCoordsOnZoom={this.state.previousMouseCoordsOnZoom}
        blockStyling={this.state.blockStyling}
        blockPositions={this.state.blockPositions}
      />
    )
  }
});

module.exports = FlowChartControllerView;
