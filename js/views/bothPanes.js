/**
 * Created by twi18192 on 25/01/16.
 */
import * as React from 'react';
import PropTypes from 'prop-types';

import MainPane from './mainPane';
import DlsSidePane from './sidePane';
import ModalDialogBox from './modalDialogBox';
import SidePaneTabContents from './sidePaneTabContents';

import mainPaneStore from '../stores/mainPaneStore';
import sidePaneStore from '../stores/sidePaneStore';
import paneStore from '../stores/paneStore';
import flowChartStore from '../stores/flowChartStore';

import paneActions from '../actions/paneActions';

import AppBar from 'react-toolbox/lib/app_bar/AppBar';
import Layout from 'react-toolbox/lib/layout/Layout';
import NavDrawer from 'react-toolbox/lib/layout/NavDrawer';
import Drawer from 'react-toolbox/lib/drawer/Drawer';
import Panel from 'react-toolbox/lib/layout/Panel';
import Sidebar from 'react-toolbox/lib/layout/Sidebar';
import theme from '../styles/mjsLayout.css';
import FontIcon from 'react-toolbox/lib/font_icon';
import Navigation from 'react-toolbox/lib/navigation/Navigation';
import styles from "../styles/mjsLayout.css";
import ThemeProvider from 'react-toolbox/lib/ThemeProvider';
import {Breadcrumbs} from 'react-breadcrumbs-dynamic';
import { Route } from 'react-router-dom'

// import ThemeProvider from 'react-css-themr/lib/components/ThemeProvider';

//console.log('bothPanes: styles', styles);
console.log('bothPanes: theme', theme);
//import {DragDropContextProvider} from 'react-dnd';
//import HTML5Backend from 'react-dnd-html5-backend';
//import ItemTypes from './dndItemTypes';

// Needed for onTouchTap
// todo: ????
//import injectTapEventPlugin from 'react-tap-event-plugin';
//injectTapEventPlugin();

let MainTabbedViewStyle = {
  "height" : "100%",
  "width"  : "100%",
  minWidth : 200,
  minHeight: 500,
  display  : 'inlineBlock'
};

let SideTabbedViewStyle = {
  float   : 'right',
  "height": "100%",
  "width" : "100%",
  maxWidth: 400
};

let BothPanesContainerStyle = {
  margin       : 0,
  padding      : 0,
  display      : 'flex',
  overflowY    : 'auto',
  flexDirection: 'row',
  height       : "100%",
  width        : "100%"
};


// Stub out window.matchMedia() if running under Jest test simulation
// as the mocked function does not appear to be supported.
window.matchMedia = window.matchMedia || function ()
    {
    return {
      matches       : false,
      addListener   : function ()
        {
        },
      removeListener: function ()
        {
        }
    };
    };

function getBothPanesState()
  {
  return {
    /* Its own getter functions first */
    sidebarOpen       : paneStore.getSidebarOpenState(),
    modalDialogBoxOpen: paneStore.getModalDialogBoxOpenState(),
    modalDialogBoxInfo: paneStore.getModalDialogBoxInfo(),

    /* MainPane's getter functions for stores */
    footers: mainPaneStore.getFooterState(),
    //favTabOpen: paneStore.getFavTabOpen(),
    //configTabOpen: paneStore.getConfigTabOpen(),
    //loadingInitialData: paneStore.getIfLoadingInitialData(),
    //loadingInitialDataError: paneStore.getIfLoadingInitialDataError(),

    /* DlsSidePane's getter functions for stores */
    tabState        : paneStore.getTabState(),
    selectedTabIndex: paneStore.getSelectedTabIndex(),
    listVisible     : sidePaneStore.getDropdownState(),

    /* Need to switch DlsSidePane content depending on whether any block are selected
     * If they are not then display a list of available blocks for the user
     * to drag to the FlowChart pane.
     * */
    areAnyBlocksSelected: flowChartStore.getIfAnyBlocksAreSelected(),
    areAnyEdgesSelected : flowChartStore.getIfAnyEdgesAreSelected(),


  }
  }

const boxTarget = {
  drop() {
  return {name: 'flowChart'};
  },
};


export default class BothPanes extends React.Component {
constructor(props)
  {
  super(props);
  this.state = getBothPanesState();
  /**
   * Navigation drawer state
   */
  this.state.drawerActive = false;
  this.state.drawerPinned  = false;
  this.state.sidebarPinned = true;

  this.__onChange         = this.__onChange.bind(this);
  this.toggleDrawerActive = this.toggleDrawerActive.bind(this);
  }

__onChange()
  {
  this.setState(getBothPanesState());
  }

componentDidMount()
  {
  let mql = window.matchMedia(`(min-width: 800px)`);
  mainPaneStore.addChangeListener(this.__onChange);
  paneStore.addChangeListener(this.__onChange);
  sidePaneStore.addChangeListener(this.__onChange);
  flowChartStore.addChangeListener(this.__onChange);

  mql.addListener(this.windowWidthMediaQueryChanged);
  this.setState({mql: mql}, function ()
  {
  paneActions.windowWidthMediaQueryChanged(this.state.mql.matches);
  });
  }

componentWillUnmount()
  {
  mainPaneStore.removeChangeListener(this.__onChange);
  paneStore.removeChangeListener(this.__onChange);
  sidePaneStore.removeChangeListener(this.__onChange);

  this.state.mql.removeListener(this.windowWidthMediaQueryChanged);
  }

windowWidthMediaQueryChanged()
  {
  paneActions.windowWidthMediaQueryChanged(this.state.mql.matches);
  }

toggleDrawerActive = () =>
  {
  this.setState({drawerActive: !this.state.drawerActive});
  };

toggleDrawerPinned = () =>
  {
  this.setState({drawerPinned: !this.state.drawerPinned});
  };

toggleSidebar = () =>
  {
  //this.setState({sidebarPinned: !this.state.sidebarPinned});
  };


render()
  {

  /* abc <DragDropContextProvider backend={HTML5Backend}> */
  /*  DragDropContextProvider established to encompass both panes (MainPane and DlsSidePane) */
  /*  This is to facilitate dragging a block from the list in the DlsSidePane and dropping it */
  /*  into the FlowChart (via MainPane)*/

  /* Note: It is not good practice to pass children as props (see SideBar below),
   * they should be passed as content between the element start and end tags.
   * TODO: Determine whether this is a design issue of react-sidebar or MalcolmJS.
   * IJG May 2017
   * */

  const actions = [
    {label: 'Alarm', raised: true, icon: 'access_alarm'},
    {label: 'Location', raised: true, accent: true, icon: 'room'}
  ];

  const bp3 =
            <Layout id="BothPanesContainer" theme={theme} className={styles.layout}>
              <NavDrawer active={this.state.drawerActive}
                         pinned={this.state.drawerPinned}
                         onOverlayClick={ this.toggleDrawerActive } theme={theme}>
                <p>
                  PandA context etc. goes here.
                </p>
              </NavDrawer>
              {/*<Panel style={{scrollY:"false", height:"100vh", width: "75%"}}>*/}
              <Panel theme={theme}>
                <div id='MainPaneDivWrapper' style={{flex: 1, overflowY: 'hidden', height: 'inherit'}}>
                <AppBar className={styles.appBar} title="Zebra2 Configurator" leftIcon='menu' theme={theme} onLeftIconClick={ this.toggleDrawerActive }>
                    {/* This is probably a good place to handle breadcrumbs */}
                  <div>
 
                    <Breadcrumbs
                      separator={<b> / </b>}
                      item={'a'}
                      finalItem={'b'}
                      finalProps={{
                        style: {color: 'red'}
                      }}
                    />
                  </div>
                </AppBar>
                  <MainPane footers={this.state.footers}/>
                </div>
              </Panel>
              {/*<Sidebar id="rightsidepane" pinned={ true } style={{overflowY:'overlap'}}>*/}
              <Sidebar width={'100%'} pinned={ true } right={true} scrollY={true} theme={theme} className={styles.RightSidebar}>
                <div><FontIcon value='close' onClick={ this.toggleSidebar }/></div>
                {/* <div id="DlsSidePaneContainerDiv" style={{flex: 1, flexDirection: 'row'}}> */}
                  <DlsSidePane id="DlsSidePane" tabState={this.state.tabState}
                               selectedTabIndex={this.state.selectedTabIndex}
                               listVisible={this.state.listVisible}
                               areAnyBlocksSelected={this.state.areAnyBlocksSelected}
                               areAnyEdgesSelected={this.state.areAnyEdgesSelected}/>
                { /* </div> */ }
              </Sidebar>
            </Layout>;


  return ( bp3 );

  }
}

BothPanes.propTypes = {
  connectDropTarget: PropTypes.func.isRequired,
  isOver           : PropTypes.bool.isRequired,
  canDrop          : PropTypes.bool.isRequired,
};
