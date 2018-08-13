import handleLocationChange from './middleware/malcolmRouting';
import MalcolmReconnector from './malcolmReconnector';
import configureMalcolmSocketHandlers from './malcolmSocketHandler';
import {
  MalcolmBlockMeta,
  MalcolmAttributeData,
  MalcolmCleanBlocks,
  MalcolmDisconnected,
  MalcolmRootBlockMeta,
  MalcolmReturn,
  MalcolmAttributeFlag,
  MalcolmError,
} from './malcolm.types';
import { snackbar } from '../viewState/viewState.actions';
import MalcolmWorkerBuilder from './worker/worker.builder';
import { processWebSocketMessage } from './worker/malcolm.worker';

jest.mock('./middleware/malcolmRouting');
jest.useFakeTimers();
jest.mock('./worker/worker.builder');

const SOCKET_BUFFER_TIME = 51;

describe('malcolm socket handler', () => {
  let dispatches = [];
  let connectionState = false;
  const drain = [];

  const state = {
    router: {
      location: {
        pathname: '',
      },
    },
    malcolm: {
      messagesInFlight: {
        1: {
          id: 1,
          path: ['block1', 'meta'],
        },
        2: {
          id: 2,
          path: ['block1', 'health'],
        },
        3: {
          typeid: 'malcolm:core/Put:1.0',
          id: 3,
          path: ['TestBlock', 'TestAttr'],
          value: null,
        },
        4: {
          id: 4,
          path: ['.', 'blocks'],
        },
      },
      blocks: {
        TestBlock: {
          attributes: [
            {
              pending: true,
              raw: {
                value: 0,
              },
              calculated: {
                name: 'TestAttr',
              },
            },
          ],
        },
      },
      navigation: {
        navigationLists: [],
      },
    },
  };

  const store = {
    dispatch: action => {
      if (typeof action === 'function') {
        action(a => dispatches.push(a), () => state);
      } else {
        dispatches.push(action);
      }
    },
    getState: () => state,
  };

  class DummySocketConstructor {
    constructor(url) {
      this.url = url;
      this.onmessage = () => {};
      this.onerror = () => {};
      this.onopen = () => {};
      this.onclose = () => {};
      this.send = payload => {
        const event = {
          data: payload,
        };
        this.onmessage(event);
      };
    }
  }

  const socketContainer = {
    socket: {},
    isConnected: () => connectionState,
    setConnected: connected => {
      connectionState = connected;
    },
    queue: [],
    flush: () => {
      drain.push(socketContainer.queue.shift());
    },
  };

  const reconnectingSocketContainer = {
    socket: {},
    isConnected: () => connectionState,
    setConnected: connected => {
      connectionState = connected;
    },
    queue: [],
    flush: () => {
      drain.push(socketContainer.queue.shift());
    },
  };

  const buildMessage = (typeid, id, payload) =>
    JSON.stringify({
      typeid: 'malcolm:core/Delta:1.0',
      id,
      changes: [
        [
          [],
          {
            typeid,
            ...payload,
          },
        ],
      ],
    });

  beforeEach(() => {
    dispatches = [];
    socketContainer.socket = new DummySocketConstructor('');
    reconnectingSocketContainer.socket = new MalcolmReconnector(
      '',
      0,
      DummySocketConstructor
    );
    reconnectingSocketContainer.socket.mockConnect = jest.fn();
    reconnectingSocketContainer.socket.connect = inputSocket =>
      inputSocket.mockConnect(inputSocket);
    socketContainer.queue = [];
    handleLocationChange.mockClear();

    MalcolmWorkerBuilder.mockClear();
    const listeners = [];
    const malcolmWorker = {
      addEventListener: (type, listener) => listeners.push(listener),
      postMessage: event => {
        listeners.forEach(l => l({ data: processWebSocketMessage(event) }));
      },
    };
    MalcolmWorkerBuilder.mockImplementation(() => malcolmWorker);

    configureMalcolmSocketHandlers(socketContainer, store);
  });

  it('sets flag and flushes on open', () => {
    socketContainer.queue.push('flushed test');
    socketContainer.socket.onopen();
    expect(socketContainer.isConnected()).toEqual(true);
    expect(drain).toEqual(['flushed test']);
    expect(dispatches.length).toEqual(2);
    expect(dispatches[0].type).toEqual(MalcolmCleanBlocks);
    expect(dispatches[1].type).toEqual(snackbar);
    expect(dispatches[1].snackbar.open).toEqual(true);
    expect(dispatches[1].snackbar.message).toEqual(`Connected to WebSocket`);
  });

  it('does nothing on receiving a non-malcolm message', () => {
    const message = JSON.stringify({ typeid: 'notAMalcolmMessage', id: 1 });
    socketContainer.socket.send(message);
    jest.runTimersToTime(SOCKET_BUFFER_TIME);
    expect(dispatches.length).toEqual(0);
  });

  it('handles block meta updates', () => {
    const message = buildMessage('malcolm:core/BlockMeta:1.0', 1, {
      label: 'Block 1',
    });

    socketContainer.socket.send(message);
    jest.runTimersToTime(SOCKET_BUFFER_TIME);

    expect(dispatches.length).toEqual(1);
    expect(dispatches[0].type).toEqual(MalcolmBlockMeta);
    expect(dispatches[0].payload.label).toEqual('Block 1');
  });

  const runAttributeUpdateTest = typeid => {
    const changes = {
      label: 'Attribute 1',
      meta: {
        tags: [],
      },
    };
    const message = buildMessage(typeid, 2, changes);

    socketContainer.socket.send(message);
    jest.runTimersToTime(SOCKET_BUFFER_TIME);

    expect(dispatches.length).toBeGreaterThanOrEqual(1);
    expect(dispatches[0].type).toEqual(MalcolmAttributeData);
    expect(dispatches[0].payload.typeid).toEqual(typeid);
  };

  it('handles scalar attribute updates', () => {
    runAttributeUpdateTest('epics:nt/NTScalar:1.0');
  });

  it('handles table attribute updates', () => {
    runAttributeUpdateTest('epics:nt/NTTable:1.0');
  });

  it('handles method updates', () => {
    runAttributeUpdateTest('malcolm:core/Method:1.0');
  });

  it('dispatches a message for unhandled deltas', () => {
    const message = buildMessage('unknown type', 1, {});

    socketContainer.socket.send(message);
    jest.runTimersToTime(SOCKET_BUFFER_TIME);

    expect(dispatches.length).toEqual(2);
    expect(dispatches[0].type).toEqual('unprocessed_delta');
    expect(dispatches[0].payload.typeid).toEqual('unknown type');

    expect(dispatches[1].type).toEqual(MalcolmAttributeData);
    expect(dispatches[1].payload.unableToProcess).toEqual(true);
  });

  it('updates snackbar on socket error', () => {
    const error = {
      type: 'TestError',
      message: 'This is a test',
    };
    const errorString = JSON.stringify(error);
    socketContainer.socket.onerror(error);
    expect(dispatches.length).toEqual(1);
    expect(dispatches[0].type).toEqual(snackbar);
    expect(dispatches[0].snackbar.open).toEqual(true);
    expect(dispatches[0].snackbar.message).toEqual(
      `WebSocket Error: ${errorString}`
    );
  });

  it('updates snackbar on socket close', () => {
    socketContainer.socket.onclose();
    expect(dispatches.length).toEqual(2);
    expect(dispatches[0].type).toEqual(snackbar);
    expect(dispatches[0].snackbar.open).toEqual(true);
    expect(dispatches[0].snackbar.message).toEqual(`WebSocket disconnected`);
    expect(dispatches[1].type).toEqual(MalcolmDisconnected);
  });

  it('updates snackbar on reconnecting socket close', () => {
    configureMalcolmSocketHandlers(reconnectingSocketContainer, store);
    reconnectingSocketContainer.socket.onclose();
    expect(dispatches.length).toEqual(2);
    expect(dispatches[0].type).toEqual(snackbar);
    expect(dispatches[0].snackbar.open).toEqual(true);
    expect(dispatches[0].snackbar.message).toEqual(
      `WebSocket disconnected; attempting to reconnect...`
    );
    expect(dispatches[1].type).toEqual(MalcolmDisconnected);
  });

  it('updates snackbar on malcolm error (no matching request)', () => {
    const malcolmError = JSON.stringify({
      typeid: 'malcolm:core/Error:1.0',
      id: -1,
      message: 'Error: this is a test!',
    });
    socketContainer.socket.send(malcolmError);

    jest.runTimersToTime(SOCKET_BUFFER_TIME);

    expect(dispatches.length).toEqual(1);
    expect(dispatches[0].type).toEqual(snackbar);
    expect(dispatches[0].snackbar.open).toEqual(true);
    expect(dispatches[0].snackbar.message).toEqual(
      'Error reported by malcolm server: "Error: this is a test!"'
    );
  });

  it('updates snackbar on malcolm error (with matching request)', () => {
    const malcolmError = JSON.stringify({
      typeid: 'malcolm:core/Error:1.0',
      id: 3,
      message: 'Error: this is a test!',
    });
    socketContainer.socket.send(malcolmError);
    jest.runTimersToTime(SOCKET_BUFFER_TIME);
    expect(dispatches.length).toEqual(3);
    expect(dispatches[0].type).toEqual(snackbar);
    expect(dispatches[0].snackbar.open).toEqual(true);
    expect(dispatches[0].snackbar.message).toEqual(
      'Error in attribute TestAttr for block TestBlock'
    );
    expect(dispatches[2].type).toEqual(MalcolmAttributeFlag);
    expect(dispatches[2].payload.path).toEqual(['TestBlock', 'TestAttr']);
    expect(dispatches[2].payload.flagType).toEqual('pending');
    expect(dispatches[1].type).toEqual(MalcolmError);
    expect(dispatches[1].payload.id).toEqual(3);
  });

  it('disptaches remove pending + stop tracking actions on return', () => {
    const pendingAction = {
      payload: {
        path: ['TestBlock', 'TestAttr'],
        flagType: 'pending',
        flagState: false,
      },
      type: 'malcolm:attributeflag',
    };
    const malcolmReturnMessage = JSON.stringify({
      typeid: 'malcolm:core/Return:1.0',
      id: 3,
    });
    socketContainer.socket.send(malcolmReturnMessage);
    jest.runTimersToTime(SOCKET_BUFFER_TIME);
    expect(dispatches.length).toEqual(2);
    expect(dispatches[1]).toEqual(pendingAction);
    expect(dispatches[0].type).toEqual(MalcolmReturn);
    expect(dispatches[0].payload.id).toEqual(3);
  });

  it('does process an update for the root .blocks item', () => {
    const message = JSON.stringify({
      typeid: 'malcolm:core/Update:1.0',
      id: 4,
      value: ['block1', 'block2', 'block3'],
    });

    socketContainer.socket.send(message);
    jest.runTimersToTime(SOCKET_BUFFER_TIME);

    expect(dispatches).toHaveLength(1);
    expect(dispatches[0].type).toEqual(MalcolmRootBlockMeta);
    expect(dispatches[0].payload.blocks).toEqual([
      'block1',
      'block2',
      'block3',
    ]);
  });

  it('doesnt process an update for if request wasnt for .blocks', () => {
    const message = JSON.stringify({
      typeid: 'malcolm:core/Update:1.0',
      id: 1,
      value: ['block1', 'block2', 'block3'],
    });

    socketContainer.socket.send(message);
    jest.runTimersToTime(SOCKET_BUFFER_TIME);

    expect(dispatches).toHaveLength(0);
  });

  it('wipes state on reconnect', () => {
    configureMalcolmSocketHandlers(reconnectingSocketContainer, store);
    reconnectingSocketContainer.socket.isReconnection = true;
    reconnectingSocketContainer.socket.onopen();
    expect(state.malcolm.messagesInFlight).toEqual({});
    expect(handleLocationChange).toHaveBeenCalledTimes(1);
  });
});
