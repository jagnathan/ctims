import styles from './MatchingMenuAndForm.module.scss';
import {EComponentType} from "./EComponentType";
import React, {FunctionComponent, useEffect, useState} from "react";
import LeftMenuComponent from "./LeftMenuComponent";
import {withTheme} from "@rjsf/core";
import {Theme as PrimeTheme} from "../primereact";
import TreeNode from "primereact/treenode";
import {ClinicalForm} from "./forms/ClinicalForm";
import {GenomicForm} from "./forms/GenomicForm";
import {EmptyHelper} from "./forms/EmptyHelper";
import {sortTreeNode} from "./helpers";
import {useSelector} from "react-redux";
import {RootState} from "../../../../../apps/web/store/store";

const RjsfForm = withTheme(PrimeTheme)

export interface IFormProps {
  node: TreeNode;
  rootNodes: TreeNode[];
}

export interface IRootNode {
  rootLabel: string;
  firstChildLabel: string;
}

interface IComponentType {
  type: EComponentType;
  node: TreeNode;
}

const MatchingMenuAndForm = (props: any) => {

  const [componentType, setComponentType] = useState<IComponentType>({type: EComponentType.None, node: {}});
  const [isEmpty, setIsEmpty] = useState(true);
  const [buildRootNodeParams, setBuildRootNodeParams] = useState<IRootNode>({rootLabel: '', firstChildLabel: ''});
  const [rootNodes, setRootNodes] = useState<TreeNode[]>([]);

  const isSortEnabled = useSelector((state: RootState) => state.context.isSortEnabled);

  useEffect(() => {
    if (rootNodes.length > 0) {
      setSortedRootNodes(rootNodes);
    }
  }, [isSortEnabled]);

  const AddCriteriaButton = (props: {addCriteriaGroupClicked: () => void}) => {
    const {addCriteriaGroupClicked} = props;
    return (
      <div className={styles.addCriteriaBtn} onClick={addCriteriaGroupClicked}>
        <i className="pi pi-plus-circle"></i>
        <span>Add criteria group</span>
      </div>
    )
  }

  const EmptyForm = (props: {addCriteriaGroupClicked: () => void}) => {
    const {addCriteriaGroupClicked} = props;
    return (
      <div className={styles.matchingCriteriaFormContainerEmpty}>
        <div className={styles.matchingCriteriaFormContainerEmptyText}>
          Matching criteria inputs will be shown here.
        </div>
        <AddCriteriaButton addCriteriaGroupClicked={addCriteriaGroupClicked} />
      </div>
    )
  }

  let ComponentToRender: FunctionComponent<IFormProps>;
  switch (componentType.type) {
    case EComponentType.ClinicalForm:
      ComponentToRender = ClinicalForm;
      break;
    case EComponentType.GenomicForm:
      ComponentToRender = GenomicForm;
      break;
    case EComponentType.AndOROperator:
      ComponentToRender = EmptyHelper;
      break;
    default:
      ComponentToRender = (props: any) => null;
  }

  const treeNodeClicked = (type: EComponentType, node: TreeNode) => {
    setIsEmpty(false);
    setComponentType({type, node});
  }

  const addCriteriaGroupClicked = () => {
    setIsEmpty(false);
    setBuildRootNodeParams({rootLabel: 'And', firstChildLabel: 'Empty Group'})
  }

  const setSortedRootNodes = (newRootNodes: TreeNode[]) => {
    // structuredClone wasn't working here, causing UI to not sync after modifying the tree
    // so pass the rootnode directly
    const sortedNodes = sortTreeNode(newRootNodes[0], 0, isSortEnabled);
    setRootNodes([sortedNodes]);
  }

  return (
    <div className={styles.matchingMenuAndFormContainer}>
      <LeftMenuComponent
        onTreeNodeClick={treeNodeClicked}
        rootNodesProp={buildRootNodeParams}
        rootNodes={rootNodes}
        setRootNodes={setSortedRootNodes}
      />
      <div className={styles.matchingCriteriaFormContainer}>
        {isEmpty ? (
          <EmptyForm addCriteriaGroupClicked={addCriteriaGroupClicked} />
        ) : (
          <ComponentToRender node={componentType.node} rootNodes={rootNodes} />
        )}
      </div>
    </div>
  );
};
export default MatchingMenuAndForm;
