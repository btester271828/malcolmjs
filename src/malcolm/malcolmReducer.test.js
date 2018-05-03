import malcolmReducer from './malcolmReducer';
import { malcolmNewParentBlockAction } from './malcolmActionCreators';
import { MalcolmBlockMeta } from './malcolm.types';

const buildAction = (type, id) => ({
  type,
  payload: {
    id,
    typeid: 'malcolm:core/Get:1.0',
  },
});

describe('malcolm reducer', () => {
  let state = {};

  beforeEach(() => {
    state = {
      messagesInFlight: [],
      blocks: {},
    };
  });

  it("doesn't affect state for non-malcolm messages", () => {
    const newState = malcolmReducer(state, buildAction('not malcolm:send'));

    expect(newState).toEqual(state);
  });

  it('tracks malcolm messages in the state', () => {
    const newState = malcolmReducer(state, buildAction('malcolm:send'));

    expect(newState.messagesInFlight.length).toEqual(1);
    expect(newState.messagesInFlight[0].type).not.toBeDefined();
    expect(newState.messagesInFlight[0].typeid).toEqual('malcolm:core/Get:1.0');
  });

  it('tracks multiple malcolm messages in the state', () => {
    state = malcolmReducer(state, buildAction('malcolm:send'));
    state = malcolmReducer(state, buildAction('malcolm:send'));

    expect(state.messagesInFlight.length).toEqual(2);
  });

  it('stops tracking a message once an error response is received', () => {
    state = {
      messagesInFlight: [{ id: 1 }, { id: 123 }],
    };

    const newState = malcolmReducer(state, buildAction('malcolm:error', 1));

    expect(newState.messagesInFlight.length).toEqual(1);
    expect(newState.messagesInFlight[0].id).toEqual(123);
  });

  it('registers a new block when one is requested', () => {
    state = malcolmReducer(state, malcolmNewParentBlockAction('block1'));

    expect(state.blocks.block1).toBeDefined();
    expect(state.blocks.block1.name).toEqual('block1');
    expect(state.blocks.block1.loading).toEqual(true);
    expect(state.parentBlock).toEqual('block1');
  });

  it('updates block if it exists', () => {
    state.blocks.block1 = {
      name: 'block1',
      loading: true,
    };

    state.messagesInFlight.push({
      id: 1,
      path: ['block1', 'meta'],
    });

    const action = {
      type: MalcolmBlockMeta,
      payload: {
        id: 1,
        delta: true,
        label: 'Block 1',
        fields: ['health', 'icon'],
      },
    };

    state = malcolmReducer(state, action);

    expect(state.blocks.block1.loading).toEqual(false);
    expect(state.blocks.block1.label).toEqual('Block 1');
    expect(state.blocks.block1.fields).toEqual([
      { name: 'health', loading: true },
      { name: 'icon', loading: true },
    ]);
  });
});
