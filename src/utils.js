



const log = {
    white: console.log,
    red: (...messages) => {
      console.log('\x1b[31m', ...messages, '\x1b[0m')
    },
    green: (...messages) => {
      console.log('\x1b[32m', ...messages, '\x1b[0m')
    },
    blue: (...messages) => {
      console.log('\x1b[34m', ...messages, '\x1b[0m')
    },
    yellow: (...messages) => {
      console.log('\x1b[33m', ...messages, '\x1b[0m')
    },
    purple: (...messages) => {
      console.log('\x1b[35m', ...messages, '\x1b[0m')
    },
    cyan: (...messages) => {
      console.log('\x1b[36m', ...messages, '\x1b[0m')
    }
  }
export { log };
