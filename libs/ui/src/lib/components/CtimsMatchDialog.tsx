import styles from './CtimsMatchDialog.module.scss';
import React, {CSSProperties, useEffect, useRef, useState} from "react";
import {Dialog} from "primereact/dialog";
import {Button} from "primereact/button";
import MatchingMenuAndForm from "./MatchingMenuAndForm";
import {OverlayPanel} from "primereact/overlaypanel";
import {useSelector} from "react-redux";
import dynamic from 'next/dynamic';
import {RootState, store} from "../../../../../apps/web/store/store";
const BrowserReactJsonView = dynamic(() => import('react-json-view'), {
  ssr: false,
});

interface CtimsMatchDialogProps {
  isDialogVisible: boolean;
  onDialogHide: () => void;
  armCode?: string;
  formData?: any;
}

const CtmlModelPreview = () => {
  const ctmlModel = useSelector((state: RootState) => state.modalActions.ctmlDialogModel);
  return (
    <div>
      {/*<BrowserReactJsonView src={ctmlModel} displayObjectSize={false} displayDataTypes={false} />*/}
      <pre>{JSON.stringify(ctmlModel, null, 2)}</pre>
    </div>
  )
}

const CtimsMatchDialog = (props: CtimsMatchDialogProps) => {
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(props.isDialogVisible);
  let {formData} = props;

  useEffect(() => {
    setIsDialogVisible(props.isDialogVisible);
  }, [props.isDialogVisible])


  const dismissBtnStyle: CSSProperties = {
    height: '36px',
    fontFamily: "'Inter', sans-serif",
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: '14px',
    lineHeight: '16px',
    color: '#2E72D2'
  }

  const saveBtnStyle: CSSProperties = {
    marginLeft: '8px',
    backgroundColor: '#2E72D2',
    fontFamily: "'Inter', sans-serif",
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: '14px',
    lineHeight: '16px',
    height: '36px'
  }

  const footer = (props: {saveMatchingCriteriaClicked: () => void, discardClicked: () => void}) => {
    const {saveMatchingCriteriaClicked, discardClicked} = props;

    return (
      <div style={{marginTop: '10px'}}>
        <Button style={dismissBtnStyle} label="Discard" className="p-button-text" onClick={discardClicked} />
        <Button style={saveBtnStyle} label="Save matching criteria" onClick={saveMatchingCriteriaClicked} />
      </div>
    )
  }

  const header = ({armCode}: {armCode: string}) => {
    return (
      <div>
        <span>{armCode} matching criteria</span>
      </div>
    )
  }

  const onDialogHide = () => {
    props.onDialogHide();
  }

  const saveClickCallback = () => {
    const currentState = store.getState();
    const ctmlModel = currentState.modalActions.ctmlDialogModel;
    console.log('callback from footer', currentState.modalActions.ctmlDialogModel);
    formData.match = ctmlModel.match;
    onDialogHide();
  }

  return (
    <Dialog header={() => header({armCode: props.armCode as string})}
            blockScroll
            footer={() => footer({saveMatchingCriteriaClicked: saveClickCallback, discardClicked: onDialogHide})}
            visible={isDialogVisible}
            style={{width: '960px', height: '710px'}}
            onHide={onDialogHide}>
      <div className={styles.mainContainer}>
        <MatchingMenuAndForm />
      </div>
    </Dialog>
  )
}
export default CtimsMatchDialog;