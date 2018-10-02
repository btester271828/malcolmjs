import {
  MalcolmNewBlock,
  MalcolmSend,
  MalcolmError,
  MalcolmBlockMeta,
  MalcolmAttributeFlag,
  MalcolmNavigationPathUpdate,
  MalcolmCleanBlocks,
  MalcolmDisconnected,
  MalcolmRootBlockMeta,
  MalcolmReturn,
  MalcolmUpdateBlockPosition,
  MalcolmShiftButton,
  MalcolmSocketConnect,
  MalcolmSelectPortType,
} from '../malcolm.types';
import blockUtils from '../blockUtils';
import { AlarmStates } from '../../malcolmWidgets/attributeDetails/attributeAlarm/attributeAlarm.component';
import NavigationReducer from './navigation.reducer';
import AttributeReducer, {
  updateAttribute,
  pushToArchive,
} from './attribute.reducer';
import layoutReducer, { LayoutReduxReducer } from './layout/layout.reducer';
import methodReducer from './method.reducer';
import tableReducer from './table.reducer';
import {
  updateBlock,
  registerNewBlock,
  updateRootBlock,
} from './block.reducer';

export const ARCHIVE_BUFFER_LENGTH = 1000; // length of circular buffer used for archiving
export const ARCHIVE_REFRESH_INTERVAL = 2.0; // minimum time in seconds between updates of displayed archive data

const initialMalcolmState = {
  messagesInFlight: {},
  counter: 0,
  navigation: {
    navigationLists: [],
    rootNav: {
      path: '',
      children: [],
      basePath: '/',
    },
  },
  blocks: {},
  blockArchive: {},
  parentBlock: undefined,
  childBlock: undefined,
  mainAttribute: undefined,
  layout: {
    blocks: [],
  },
  layoutEngine: undefined,
  layoutState: {
    shiftIsPressed: false,
    selectedBlocks: [],
    selectedLinks: [],
    layoutCenter: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 - 64,
    },
    startPortForLink: undefined,
    endPortForLink: undefined,
    showBin: false,
    inDeleteZone: false,
  },
};

function updateMessagesInFlight(state, action) {
  const newState = state;

  if (
    action.payload.typeid !== 'malcolm:core/Subscribe:1.0' ||
    !Object.keys(state.messagesInFlight).some(
      m =>
        state.messagesInFlight[m] !== undefined &&
        state.messagesInFlight[m].path.join() === action.payload.path.join()
    )
  ) {
    newState.messagesInFlight = {
      ...state.messagesInFlight,
    };
    newState.messagesInFlight[action.payload.id] = action.payload;
  }

  return newState;
}

function stopTrackingMessage(state, action) {
  const filteredMessages = { ...state.messagesInFlight };
  delete filteredMessages[action.payload.id];
  return {
    ...state,
    messagesInFlight: filteredMessages,
  };
}

function setFlag(state, path, flagType, flagState) {
  if (path.length === 1) {
    const blocks = { ...state.blocks };
    const block = { ...blocks[path[0]] };
    block[flagType] = flagState;
    blocks[path[0]] = block;
    return {
      ...state,
      blocks,
    };
  }
  const blockName = path[0];
  const attributeName = path[1];

  const blocks = { ...state.blocks };
  const matchingAttribute = blockUtils.findAttributeIndex(
    blocks,
    blockName,
    attributeName
  );
  let recalculateLayout = false;

  if (matchingAttribute >= 0) {
    const attributes = [...state.blocks[blockName].attributes];
    const attributeCopy = {
      ...attributes[matchingAttribute],
      calculated: {
        ...attributes[matchingAttribute].calculated,
      },
    };
    attributeCopy.calculated[flagType] = flagState;
    if (flagType === 'dirty') {
      attributeCopy.calculated.alarms = {
        ...attributeCopy.calculated.alarms,
        dirty: flagState ? AlarmStates.DIRTY : null,
      };
    } else if (flagType === 'pending' && flagState === true) {
      if (path[path.length - 1] === 'label') {
        // only a PUT on the label attribute actually affects whether
        // the layout should show the loading screen in blocks
        attributeCopy.calculated.loading = true;
        recalculateLayout = true;
      }
    }

    attributes[matchingAttribute] = attributeCopy;
    blocks[blockName] = { ...state.blocks[blockName], attributes };
  }

  const updatedState = {
    ...state,
    blocks,
  };

  // update layout here if it was a pending/true update
  if (recalculateLayout) {
    const layoutUpdates = layoutReducer.updateLayoutAndEngine(updatedState);
    updatedState.layout = layoutUpdates.layout;
    updatedState.layoutEngine = layoutUpdates.layoutEngine;
  }

  return updatedState;
}

function cleanBlocks(state) {
  const blocks = { ...state.blocks };
  Object.keys(blocks).forEach(blockName => {
    blocks[blockName] = {
      ...blocks[blockName],
      loading: true,
    };
  });
  return {
    ...state,
    blocks,
  };
}

function setDisconnected(state) {
  const blocks = { ...state.blocks };
  Object.keys(blocks).forEach(blockName => {
    if (Object.prototype.hasOwnProperty.call(blocks[blockName], 'attributes')) {
      const attributes = [...state.blocks[blockName].attributes];
      for (let attr = 0; attr < attributes.length; attr += 1) {
        if (Object.prototype.hasOwnProperty.call(attributes[attr], 'raw')) {
          if (
            Object.prototype.hasOwnProperty.call(attributes[attr].raw, 'meta')
          ) {
            attributes[attr].raw = {
              ...attributes[attr].raw,
              meta: {
                ...attributes[attr].raw.meta,
                writeable: false,
              },
            };
          }
          if (
            Object.prototype.hasOwnProperty.call(attributes[attr].raw, 'alarm')
          ) {
            attributes[attr].raw = {
              ...attributes[attr].raw,
              alarm: {
                ...attributes[attr].raw.alarm,
                severity: AlarmStates.UNDEFINED_ALARM,
              },
            };
            if (
              state.blockArchive[blockName] &&
              state.blockArchive[blockName].attributes[attr] &&
              state.blockArchive[blockName].attributes[attr].alarmState.get(
                state.blockArchive[blockName].attributes[
                  attr
                ].alarmState.size() - 1
              ) !== AlarmStates.UNDEFINED_ALARM
            ) {
              const { timeStamp } = attributes[attr].raw;
              pushToArchive(
                state.blockArchive[blockName].attributes[attr],
                {
                  raw: {
                    timeStamp,
                    value: attributes[attr].raw.value,
                  },
                },
                AlarmStates.UNDEFINED_ALARM
              );
            }
          }
        }
      }
      blocks[blockName] = { ...state.blocks[blockName], attributes };
    }
  });
  return {
    ...state,
    blocks,
    counter: 0,
  };
}

export const setErrorState = (state, id, errorState, errorMessage) => {
  // #refactorDuplication
  const matchingMessage = state.messagesInFlight[id];
  const path = matchingMessage ? matchingMessage.path : undefined;
  if (path) {
    const blockName = path[0];
    const attributeName = path[1];

    const matchingAttributeIndex = blockUtils.findAttributeIndex(
      state.blocks,
      blockName,
      attributeName
    );
    const blocks = { ...state.blocks };
    if (matchingAttributeIndex >= 0) {
      const { attributes } = state.blocks[blockName];
      attributes[matchingAttributeIndex] = {
        ...attributes[
          matchingAttributeIndex
        ] /*
        errorState,
        errorMessage,
        dirty: errorState,
        forceUpdate: !errorState, */,
        calculated: {
          ...attributes[matchingAttributeIndex].calculated,
          errorState,
          errorMessage,
          dirty: errorState,
          forceUpdate: !errorState,
          alarms: {
            ...attributes[matchingAttributeIndex].calculated.alarms,
            dirty: errorState ? AlarmStates.DIRTY : null,
            errorState: errorState ? AlarmStates.MAJOR_ALARM : null,
          },
        },
      };
      blocks[blockName] = { ...state.blocks[blockName], attributes };
    }
    return {
      ...state,
      blocks,
    };
  }
  return state;
};

function handleReturnMessage(state, action) {
  const newState = setErrorState(state, action.payload.id, false, 'Successful');
  return stopTrackingMessage(newState, action);
}

const handleErrorMessage = (state, action) => {
  const matchingMessage = state.messagesInFlight[action.payload.id];
  let updatedState = { ...state };
  if (matchingMessage && matchingMessage.path) {
    const blockName = matchingMessage.path[0];
    const matchingAttributeIndex = blockUtils.findAttributeIndex(
      state.blocks,
      blockName,
      matchingMessage.path[1]
    );
    const attribute =
      matchingAttributeIndex > -1
        ? state.blocks[blockName].attributes[matchingAttributeIndex]
        : undefined;
    if (
      attribute &&
      attribute.raw &&
      attribute.raw.meta &&
      attribute.raw.meta.tags &&
      attribute.raw.meta.tags.some(t => t === 'widget:flowgraph')
    ) {
      // reset the layout
      const id = attribute.id === undefined ? attribute.id : action.payload.id;
      updatedState = updateAttribute(state, {
        id,
        delta: true,
      });
    } else if (
      attribute &&
      attribute.raw.typeid === 'malcolm:core/Method:1.0'
    ) {
      const attributes = [...state.blockArchive[blockName].attributes];
      const archive = { ...attributes[matchingAttributeIndex] };
      const runParams = archive.value.pop();
      const localRunTime = archive.timeStamp.pop();
      archive.value.push({
        ...runParams,
        returned: { error: action.payload.message },
        returnStatus: `Failed: ${action.payload.message}`,
      });
      archive.timeStamp.push({ ...localRunTime, localReturnTime: new Date() });
      archive.alarmState.push(AlarmStates.MAJOR_ALARM);
      attributes[matchingAttributeIndex] = archive;
      updatedState.blockArchive[blockName] = {
        ...state.blockArchive[blockName],
        attributes,
      };
    }
  }

  updatedState = setErrorState(
    updatedState,
    action.payload.id,
    true,
    action.payload.message
  );
  return stopTrackingMessage(updatedState, action);
};

const updateSocket = (state, payload) => {
  const { worker } = payload;
  worker.postMessage(`connect::${payload.socketUrl}`);

  return {
    ...state,
  };
};

const updateLayoutOnState = state => {
  const updatedState = state;
  const layoutUpdates = layoutReducer.updateLayoutAndEngine(updatedState);
  updatedState.layout = layoutUpdates.layout;
  updatedState.layoutEngine = layoutUpdates.layoutEngine;

  return updatedState;
};

const malcolmReducer = (state = initialMalcolmState, action = {}) => {
  let updatedState = AttributeReducer(state, action);
  updatedState = methodReducer(updatedState, action);
  updatedState = tableReducer(updatedState, action);
  updatedState = LayoutReduxReducer(updatedState, action);

  switch (action.type) {
    case MalcolmNewBlock:
      return registerNewBlock(updatedState, action);

    case MalcolmAttributeFlag:
      return setFlag(
        state,
        action.payload.path,
        action.payload.flagType,
        action.payload.flagState
      );

    case MalcolmSend:
      return updateMessagesInFlight(updatedState, action);

    case MalcolmError:
      return handleErrorMessage(updatedState, action);

    case MalcolmReturn:
      return handleReturnMessage(updatedState, action);

    case MalcolmBlockMeta:
      updatedState = updateBlock(updatedState, action.payload);
      return NavigationReducer.updateNavTypes(updatedState);

    case MalcolmRootBlockMeta:
      updatedState = updateRootBlock(updatedState, action.payload);
      return NavigationReducer.updateNavTypes(updatedState);

    case MalcolmNavigationPathUpdate:
      updatedState = NavigationReducer.updateNavigationPath(
        updatedState,
        action.payload
      );

      updatedState = NavigationReducer.updateNavTypes(updatedState);
      updatedState = updateLayoutOnState(updatedState);

      return updatedState;

    case MalcolmCleanBlocks:
      return cleanBlocks(updatedState);

    case MalcolmDisconnected:
      return setDisconnected(updatedState);

    case MalcolmUpdateBlockPosition:
      layoutReducer.updateBlockPosition(
        updatedState,
        action.payload.translation
      );

      return {
        ...updatedState,
        layout: layoutReducer.processLayout(updatedState),
      };

    case MalcolmSelectPortType:
      return layoutReducer.selectPortForLink(
        updatedState,
        action.payload.portId,
        action.payload.start
      );

    case MalcolmShiftButton:
      return layoutReducer.shiftIsPressed(updatedState, action.payload);

    case MalcolmSocketConnect:
      return updateSocket(updatedState, action.payload);

    default:
      return updatedState;
  }
};

export default malcolmReducer;
