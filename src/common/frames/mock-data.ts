const username = 'data';
const token = 'data';

export const data = {
  username,
  token,
  frameConnect: {
    type: 'connect',
    username,
  } as any,
  frameReconnect: {
    type: 'reconnect',
    token,
  } as any,
  frameMessage: {
    type: 'message',
    parts: [
      {
        text: 'test',
        format: ['data1', 'data2'],
      },
      {
        text: 'test2',
        format: ['data3', 'data4'],
      },
    ],
  } as any,
  frameAvailableEntities: {
    type: 'available_entities',
    items: [
      {
        id: 'test',
        name: 'data1',
      },
      {
        id: 'test2',
        name: 'data2',
      },
    ],
  } as any,
  frameCommandList: {
    type: 'command_list',
    commands: [
      {
        base: 'test',
        arguements: [
          {
            name: 'joe',
            type: 'data',
            optional: true,
          },
        ],
      },
      {
        base: 'test2',
        arguements: [
          {
            name: 'joe2',
            type: 'data2',
            optional: false,
          },
        ],
      },
    ],
  },
  frameAssignToken: {
    type: 'assign_token',
    token: 'data',
  },
  frameSendCommand: {
    type: 'send_command',
    command: 'test',
    arguements: [
      {
        name: 'joe',
        value: 'data',
      },
    ],
  },
  frameRequestCommandList: {
    type: 'request_command_list',
  },
    frameUsernameTaken: {
    type: 'username_taken',
    username: 'username',
  }
};
