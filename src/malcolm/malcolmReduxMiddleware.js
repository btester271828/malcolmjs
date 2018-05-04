import {
  malcolmSubscribeAction,
  malcolmNewParentBlockAction,
} from './malcolmActionCreators';
import { MalcolmSend } from './malcolm.types';

function buildMalcolmMessage(payload) {
  const message = { ...payload };
  delete message.type;

  return message;
}

function findNextId(store) {
  const { messagesInFlight } = store.getState().malcolm;
  if (!messagesInFlight || messagesInFlight.length === 0) {
    return 1;
  }
  const maxId = Math.max(...messagesInFlight.map(m => m.id));
  return maxId + 1;
}

function handleLocationChange(queryParams, store) {
  // temporary until we sort proper route handling
  const parameters = {};
  queryParams
    .substr(1)
    .split('&')
    .map(kvp => kvp.split('='))
    .forEach(kvp => {
      const [key, value] = kvp;
      parameters[key] = value;
    });
  store.dispatch(malcolmNewParentBlockAction(parameters.block));
  store.dispatch(malcolmSubscribeAction([parameters.block, 'meta']));
}

// eslint-disable-next-line no-unused-vars
const buildMalcolmReduxMiddleware = socket => store => next => action => {
  const updatedAction = { ...action };

  switch (action.type) {
    case MalcolmSend:
      updatedAction.payload.id = findNextId(store);
      socket.send(buildMalcolmMessage(action.payload));
      break;

    case '@@router/LOCATION_CHANGE':
      handleLocationChange(action.payload.search, store);

      break;

    default:
      break;
  }

  return next(updatedAction);
};

export default buildMalcolmReduxMiddleware;