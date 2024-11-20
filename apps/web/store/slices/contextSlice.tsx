import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {logout} from "../../pages/api/auth/[...nextauth]";
import {SELECTED_TRIAL_GROUP_ID, SELECTED_TRIAL_GROUP_IS_ADMIN} from "../../constants/appConstants";

export interface ContextSliceState {
  schema_version: number;
  trialId: number;
  trialNctId: string;
  seletedTrialGroupId: string;
  isTrialGroupAdmin: boolean;
  isFormDisabled: boolean;
  isFormChanged: boolean;
  isAccessTokenSet: boolean;
  isLongOperation: boolean;
  isSortEnabled: boolean;
}

const initialState: ContextSliceState = {
  schema_version: 1,
  trialId: 0,
  trialNctId: '',
  seletedTrialGroupId: '',
  isTrialGroupAdmin: false,
  isFormDisabled: false,
  isFormChanged: false,
  isAccessTokenSet: false,
  isLongOperation: false,
  isSortEnabled: false
}

export const contextSlice = createSlice({
  name: 'context',
  initialState,
  reducers: {
    setSchemaVersion: (state, action: PayloadAction<number>) => {
      state.schema_version = action.payload
    },
    setTrialId: (state, action: PayloadAction<number>) => {
      state.trialId = action.payload
    },
    setTrialNctId: (state, action: PayloadAction<string>) => {
      state.trialNctId = action.payload
    },
    selectedTrialGroupId: (state, action: PayloadAction<string>) => {
      state.seletedTrialGroupId = action.payload
    },
    setIsTrialGroupAdmin: (state, action: PayloadAction<boolean>) => {
      state.isTrialGroupAdmin = action.payload
    },
    setIsFormDisabled: (state, action: PayloadAction<boolean>) => {
      state.isFormDisabled = action.payload
    },
    setIsFormChanged: (state, action: PayloadAction<boolean>) => {
      state.isFormChanged = action.payload
    },
    setIsAccessTokenSet: (state, action: PayloadAction<boolean>) => {
      state.isAccessTokenSet = action.payload
    },
    setIsLongOperation: (state, action: PayloadAction<boolean>) => {
      state.isLongOperation = action.payload;
    },
    resetTrialId: (state) => {
      state.trialId = 0;
    },
    setIsSortEnabled: (state, action: PayloadAction<boolean>) => {
      state.isSortEnabled = action.payload;
    }
  },
  // use extraReducers to listen to other action types
  extraReducers: (builder) => {
    builder.addCase(logout, () => {
      localStorage.removeItem('ctims-accessToken');
      sessionStorage.removeItem(SELECTED_TRIAL_GROUP_ID);
      sessionStorage.removeItem(SELECTED_TRIAL_GROUP_IS_ADMIN);
      return initialState
    })
  }
});

export const {
  setSchemaVersion,
  setTrialId,
  setTrialNctId,
  selectedTrialGroupId,
  setIsTrialGroupAdmin,
  setIsFormDisabled,
  setIsFormChanged,
  setIsAccessTokenSet,
  setIsLongOperation,
  setIsSortEnabled,
  resetTrialId
  } = contextSlice.actions;
export default contextSlice.reducer;
