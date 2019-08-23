/**
 * 
 * React - Redux Reducers
 * 
 */

/**
 * 
 * @param {*} state 
 * @param {*} action 
 */
const react = (state = [], action) => {
    switch (action.type) {
        case 'PLAY_STREAM':
           return state;

        case 'PLAY_OFFLINE_STREAM':
           return state;

        default:
            return state
    }
}

export default react;