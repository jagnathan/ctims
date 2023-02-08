import TreeNode from "primereact/treenode";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface IKeyToViewModel {
  [key: string]: TreeNode[];
}

export interface IMatchViewModelState {
  viewModel: IKeyToViewModel;
  activeArmId: string;
}

const initialState: IMatchViewModelState = {
  viewModel: {},
  activeArmId: ''
}

export const matchViewModelSlice = createSlice({
  name: 'matchViewModelActions',
  initialState,
  reducers: {
    setMatchViewModel: (state, action: PayloadAction<IKeyToViewModel>) => {
      state.viewModel = {...state.viewModel, ...action.payload};
    },
    setActiveArmId: (state, action: PayloadAction<string>) => {
      state.activeArmId = action.payload;
    },
    resetActiveArmId: (state) => {
      state.activeArmId = '';
    }
  }
})

export const {setMatchViewModel, setActiveArmId, resetActiveArmId} = matchViewModelSlice.actions
export default matchViewModelSlice.reducer
