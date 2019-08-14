const react = (state = [], action) => {
    switch (action.type) {
        case 'LIST_STREAMS':
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]
        case 'LIST_DOWNLOADED_STREAMS':
            return state.map(stream =>
                stream.id === action.id ? { ...stream, completed: !stream.completed } : stream
            )
        case 'SELECT_QUALITY':
            return state.map(stream =>
                stream.id === action.id ? { ...stream, completed: !stream.completed } : stream
            )
        case 'DOWNLOAD_STREAM':
            return state.map(stream =>
                stream.id === action.id ? { ...stream, completed: !stream.completed } : stream
            )
        case 'SHOW_STREAM_DETIALS':
            return state.map(stream =>
                stream.id === action.id ? { ...stream, completed: !stream.completed } : stream
            )
        case 'PLAY_STREAM':
            return state.map(stream =>
                stream.id === action.id ? { ...stream, completed: !stream.completed } : stream
            )
      default:
        return state
    }
  }
  
export default react;