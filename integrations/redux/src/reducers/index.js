import { combineReducers } from 'redux'
import downstream from './downstream'
import react from './react'

export default combineReducers({
    downstream,
    react
})
