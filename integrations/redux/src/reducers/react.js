/**
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
            /*
            return state.map(stream =>
                stream.id === action.id ? { ...stream, completed: !stream.completed } : stream
            )
            */
           return state;

        case 'PLAY_OFFLINE_STREAM':
            /*
            return state.map(stream =>
                stream.id === action.id ? { ...stream, completed: !stream.completed } : stream
            )
            */
           return state;

        default:
            return state
    }
}

export default react;