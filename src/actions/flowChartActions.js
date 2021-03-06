/**
 * Created by twi18192 on 19/02/16.
 */

import AppDispatcher from '../dispatcher/appDispatcher.js';
import appConstants  from '../constants/appConstants.js';

class FlowChartActions {

interactJsDrag(item)
  {
  AppDispatcher.handleAction({
    actionType: appConstants.INTERACTJS_DRAG,
    item      : item
  })
  }


selectBlock(item)
  {
  AppDispatcher.handleAction({
    actionType: appConstants.SELECT_BLOCK,
    item      : item
  })
  }

holdBlock(item)
  {
  AppDispatcher.handleAction({
    actionType: appConstants.HOLD_BLOCK,
    item      : item
  })
  }

releaseBlock(item)
  {
  AppDispatcher.handleAction({
    actionType: appConstants.RELEASE_BLOCK,
    item      : item
  })
  }

removeBlock(blockName)
  {
  AppDispatcher.handleAction({
    actionType: appConstants.REMOVE_BLOCK,
    item      : blockName
  })
  }

deselectAllBlocks(item)
  {
  AppDispatcher.handleAction({
    actionType: appConstants.DESELECT_ALLBLOCKS,
    item      : item
  })
  }

selectEdge(item)
  {
  AppDispatcher.handleAction({
    actionType: appConstants.SELECT_EDGE,
    item      : item
  })
  }

deselectAllEdges(item)
  {
  AppDispatcher.handleAction({
    actionType: appConstants.DESELECT_ALLEDGES,
    item      : item
  })
  }

changeGraphPosition(item)
  {
  AppDispatcher.handleAction({
    actionType: appConstants.CHANGE_GRAPHPOSITION,
    item      : item
  })
  }

graphZoom(item)
  {
  AppDispatcher.handleViewAction({
    actionType: appConstants.GRAPH_ZOOM,
    item      : item
  })
  }

getAnyEdgeSelectedState(item)
  {
  AppDispatcher.handleAction({
    actionType: appConstants.GETANY_EDGESELECTEDSTATE,
    item      : item
  })
  }

passPortMouseDown(port)
  {
  AppDispatcher.handleAction({
    actionType: appConstants.PASS_PORTMOUSEDOWN,
    item      : port
  })
  }

deselectAllPorts(item)
  {
  AppDispatcher.handleAction({
    actionType: appConstants.DESELECT_ALLPORTS,
    item      : item
  })
  }

storingFirstPortClicked(item)
  {
  AppDispatcher.handleAction({
    actionType: appConstants.STORING_FIRSTPORTCLICKED,
    item      : item
  })
  }

//appendToEdgeSelectedState(item){
//  AppDispatcher.handleAction({
//    actionType: appConstants.APPEND_EDGESELECTEDSTATE,
//    item: item
//  })
//}
addEdgePreview(item)
  {
  AppDispatcher.handleAction({
    actionType: appConstants.ADD_EDGEPREVIEW,
    item      : item
  })
  }

updateEdgePreviewEndpoint(item)
  {
  AppDispatcher.handleAction({
    actionType: appConstants.UPDATE_EDGEPREVIEWENDPOINT,
    item      : item
  })
  }

clickedBackground()
  {
  AppDispatcher.handleViewAction({
    actionType: appConstants.NAVBAR_ACTION,
    item      : null
  })
  }


/**
 *
 * @param {DroppedPaletteInfo} info
 */
dropPaletteFromList(info)
  {
  // Sanity check that this was called with the expected class type.
  if (info instanceof DroppedPaletteInfo)
    {
    AppDispatcher.handleAction({
      actionType: appConstants.DROPPED_PALETTE_FROM_LIST,
      item      : info
    })
    }
  }

dropBlockFromCanvas(info)
  {
  // Sanity check that this was called with the expected class type.
  if (info instanceof DroppedPaletteInfo)
    {
    AppDispatcher.handleAction({
      actionType: appConstants.DROPPED_BLOCK_FROM_CANVAS,
      item      : info
    })
    }
  }
//appendToBlockSelectedStates(item){
//  AppDispatcher.handleAction({
//    actionType: appConstants.APPENDTO_BLOCKSELECTEDSTATES,
//    item: item
//  })
//}
}

/**
 * @class DroppedPaletteInfo
 * @description Encapsulates information from dropBlockFromList() action creator, allowing type checking.
 */
class DroppedPaletteInfo
{
/**
 * @param {name} item
 * @param {x, y} offset
 */
constructor(item, offset)
    {
    //this.info = {item:{name:""}, coords:{x:0, y:0}};
    this.info = {item, offset};
    }

  get name()
    {
    return(this.info.item.name);
    }

  get offset()
    {
    return(this.info.offset);
    }
}

/**
 * @class DroppedBlockInfo
 * @description Encapsulates information from dropBlockFromList() action creator, allowing type checking.
 */
class DroppedBlockInfo
{
/**
 * @param {name} item
 * @param {x, y} offset
 */
constructor(item, offset)
  {
  //this.info = {item:{name:""}, coords:{x:0, y:0}};
  this.info = {item, offset};
  }

get name()
  {
  return(this.info.item.name);
  }

get offset()
  {
  return(this.info.offset);
  }
}

const flowChartActions = new FlowChartActions();

export {flowChartActions as default, DroppedPaletteInfo, DroppedBlockInfo};



