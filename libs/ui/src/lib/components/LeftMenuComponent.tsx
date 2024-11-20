import styles from "./LeftMenuComponent.module.scss";
import {
  Tree,
  TreeDragDropParams,
  TreeExpandedKeysType,
  TreeTogglerTemplateOptions
} from "primereact/tree";
import React, {memo, useContext, useEffect, useRef, useState} from "react";
import TreeNode from "primereact/treenode";
import {Button} from "primereact/button";
import {TieredMenu} from "primereact/tieredmenu";
import {
  buildEmptyGroup,
  buildRootNodes,
  convertCtimsFormatToTreeNodeArray,
  convertTreeNodeArrayToCtimsFormat,
  deleteNodeFromChildrenArrayByKey,
  findArrayContainingKeyInsideATree,
  findObjectByKeyInTree,
  flattenVariantCategoryContainerObject,
  flattenVariantCategoryContainerObjectInCtmlMatchModel,
  getNodeLabel,
  isObjectEmpty,
  traverseNode,
  trimFields
} from "./helpers";
import * as jsonpath from "jsonpath";
import {EComponentType} from "./EComponentType";
import {IRootNode} from "./MatchingMenuAndForm";
import {useDispatch, useSelector} from "react-redux";
import {
  deleteMatchDialogError,
  deleteNode,
  IAddCriteria,
  IDeleteCriteria,
  IMoveCriteriaDnD,
  IOperatorChange, moveNodeDnD, operatorChange,
  setCtmlDialogModel, setMatchDialogErrors
} from "../../../../../apps/web/store/slices/modalActionsSlice";
import {structuredClone} from "next/dist/compiled/@edge-runtime/primitives/structured-clone";
import {v4 as uuidv4} from 'uuid';
import {IKeyToViewModel, setMatchViewModel} from "../../../../../apps/web/store/slices/matchViewModelSlice";
import {RootState, store} from "../../../../../apps/web/store/store";
import {classNames} from "primereact/utils";
import {CtimsDialogContext, CtimsDialogContextType} from "./CtimsMatchDialog";
import {ToggleButton} from "primereact/togglebutton";
import {setIsSortEnabled} from "../../../../../apps/web/store/slices/contextSlice";


interface ILeftMenuComponentProps {
  onTreeNodeClick: (componentType: EComponentType, note: TreeNode) => void;
  rootNodesProp: IRootNode;
  rootNodes: TreeNode[];
  setRootNodes: (newRootNodes: TreeNode[]) => void;
}

const LeftMenuComponent = memo((props: ILeftMenuComponentProps) => {

  const {onTreeNodeClick, rootNodesProp, rootNodes, setRootNodes} = props;

  const {setSaveBtnState} = useContext(CtimsDialogContext) as CtimsDialogContextType;

  // const [rootNodes, setRootNodes] = useState<TreeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedKeys, setSelectedKeys] = useState<any>(null);
  const [expandedKeys, setExpandedKeys] = useState<TreeExpandedKeysType>({0: true});

  const newNodeValue: IAddCriteria = useSelector((state: RootState) => state.modalActions.addCriteria);
  const nodeKeyToBeDeleted: IDeleteCriteria = useSelector((state: RootState) => state.modalActions.deleteCriteria);
  const nodeKeyToBeMovedDnD: IMoveCriteriaDnD = useSelector((state: RootState) => state.modalActions.moveCriteriaDnD);
  const operatorChanged: IOperatorChange = useSelector((state: RootState) => state.modalActions.operatorChange);
  const formChangedCounter: number = useSelector((state: RootState) => state.modalActions.formChangeCounter);
  const matchDialogErrors = useSelector((state: RootState) => state.modalActions.matchDialogErrors);

  const isSortedChecked = useSelector((state: RootState) => state.context.isSortEnabled);

  const dispatch = useDispatch();

  const setRootNodesState = (newRootNodes: TreeNode[]) => {
    setRootNodes(newRootNodes);
    if (newRootNodes[0].children && newRootNodes[0].children.length > 0) {
      const defaultSelectedNode = getLastVerticalNode(newRootNodes);
      setSelectedNode(defaultSelectedNode);
      setSelectedKeys(defaultSelectedNode.key);
      onTreeNodeClick(defaultSelectedNode.data.type, defaultSelectedNode);
    } else {
      onTreeNodeClick(EComponentType.None, newRootNodes[0]);
    }
  }

  // this gets call onChange to trigger the dispatch
  const updateReduxViewModelAndCtmlModel = (newRootNodes: TreeNode[], state: RootState) => {
    const activeArmId: string = state.matchViewModelActions.activeArmId;
    const viewModel: IKeyToViewModel = {};
    const flattenedNewRootNodes = flattenVariantCategoryContainerObject(newRootNodes);
    viewModel[activeArmId] = structuredClone(flattenedNewRootNodes);
    dispatch(setMatchViewModel(viewModel))
    // convert view model (rootNodes) to ctims format
    const ctimsFormat = convertTreeNodeArrayToCtimsFormat(flattenedNewRootNodes);
    const trimmedCtimsFormat = JSON.parse(JSON.stringify(ctimsFormat));
    trimFields(trimmedCtimsFormat);
    dispatch(setCtmlDialogModel(trimmedCtimsFormat));
    // console.log('ctimsFormat: ', ctimsFormat)
    // console.log('newRootNodes: ', newRootNodes)
    if (flattenedNewRootNodes.length > 0 && flattenedNewRootNodes[0].children && flattenedNewRootNodes[0].children.length === 0) {
        setSaveBtnState(true);
    }
    if (checkHasEmptyNode(trimmedCtimsFormat.match)) {
      setSaveBtnState(true);
    }
  }

  // check if there are empty clinical node object, clinical can be empty after trim, such as empty age field
  // whereas genomic node will require variant category so it won't be empty after trim
  function checkHasEmptyNode(obj: any) {
    if (Array.isArray(obj)) {
      for (let element of obj) {
        if (checkHasEmptyNode(element)) {
          return true;
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (let key in obj) {
        if ((key === 'clinical') && Object.keys(obj[key]).length === 0) {
          return true;
        }
        // If the key is 'and' or 'or', recursively check the nested objects
        else if ((key === 'and' || key === 'or') && checkHasEmptyNode(obj[key])) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Expands all nodes in the tree.
   * @param nodes -  Root nodes to begin the expansion on.
   */
  const expandAllNodes = (nodes: TreeNode[]) => {
    const _expandedKeys: TreeExpandedKeysType = { };

    for (const node of nodes) {
      expandNode(node, _expandedKeys);
    }

    setExpandedKeys(_expandedKeys);
  };

  /**
   * Given a node and a carry over value, expand the node and all its children.
   * @param node -  Node to expand
   * @param _expandedKeys - Carryover value of node keys to expand. Acts as a hash map where the key is the node key, and the value is true to represent that it should be expanded.
   */
  const expandNode = (node: TreeNode, _expandedKeys: TreeExpandedKeysType) => {
    // if the node has children, add the key to the carryover and recurse on the children
    if (node.children && node.children.length && node.key) {
      const key = node.key;
      _expandedKeys[key] = true;

      for (const child of node.children) {
        expandNode(child, _expandedKeys);
      }
    }
  };

  /**
   * Gets the key of the last node vertically from the visual perspective
   * For example, in the tree below seven is selected because it is the last element in the tree vertically
   * ```
   * one
   *  - two
   *  - three
   *    - five
   *  - four
   *    - six
   *      - ***seven***
   * ```
   * @param nodes - List of root nodes
   */
  const getLastVerticalNode = (nodes: TreeNode[]): TreeNode => {
    // Look for the last node in the children list, recurse on that node
    const lastNode = nodes[nodes.length - 1];
    if(lastNode.children && lastNode.children!.length > 0) {
      return getLastVerticalNode(lastNode.children!);
    }
    return lastNode;
  }

  useEffect(() => {
    // on initial load, update the ctmlDialogModel so that it's current and up-to-date
    const state = store.getState();
    const currentCtmlMatchModel: any = state.matchViewModelActions.ctmlMatchModel;
    const curMatch = currentCtmlMatchModel.match;
    if (curMatch && curMatch.length > 0) {
      const flattenedMatch = flattenVariantCategoryContainerObjectInCtmlMatchModel(curMatch[0]);
      dispatch(setCtmlDialogModel({match: [flattenedMatch]}));
    }

  }, []);

  useEffect(() => {
    const state = store.getState();
    const currentCtmlMatchModel: any = state.matchViewModelActions.ctmlMatchModel;

    // formChangedCounter is used to determine if the dialog just opened or if the form was changed
    if (formChangedCounter === 0) {
      // if the form was not changed, we check if there is a view model in the redux store
      if (!isObjectEmpty(currentCtmlMatchModel.match)) {
        setSaveBtnState(false);
        // console.log('currentCtmlMatchModel.match', currentCtmlMatchModel.match)
        if (rootNodes.length === 0) {
          const newViewModel = convertCtimsFormatToTreeNodeArray({match: currentCtmlMatchModel.match});
          setRootNodesState(newViewModel);
          expandAllNodes(newViewModel);
          // Select the last node (visually vertically)
          const lastVerticalNode = getLastVerticalNode(newViewModel);
          setSelectedKeys(lastVerticalNode.key);
          setSelectedNode(lastVerticalNode);
          onTreeNodeClick(lastVerticalNode.data.type, lastVerticalNode);
        }
      } else {
        setSaveBtnState(true);
      }
    }

    // if the form was changed, update the redux store with the new view model and ctims format
    if (formChangedCounter > 0) {
      // console.log('form changed in left menu component');
      updateReduxViewModelAndCtmlModel(rootNodes, state);
    }
  }, [formChangedCounter]);

  useEffect(() => {
    if (newNodeValue && newNodeValue.nodeKey && newNodeValue.type && rootNodes.length > 0) {
      let {nodeKey, type}: {nodeKey: string, type: string} = newNodeValue;

      // Callback when add criteria button is clicked ( the one inside the form )
      addCriteria(nodeKey, type);
    }
  }, [newNodeValue]);

  // when a node is deleted we update the root nodes state
  useEffect(() => {
    if (nodeKeyToBeDeleted.nodeKey) {
      // enable save button first, save button status will be checked again in updateReduxViewModelAndCtmlModel
      // once node is removed
      setSaveBtnState(false)
      // structuredClone does not update the state properly, the UI was not updating
      // spread operator shallow copy was able to sync UI with state properly
      // const newRootNodes = structuredClone(rootNodes);
      const newRootNodes = [...rootNodes];
      deleteNodeFromChildrenArrayByKey(newRootNodes[0], nodeKeyToBeDeleted.nodeKey);
      setRootNodesState(newRootNodes);
      const state = store.getState();
      updateReduxViewModelAndCtmlModel(newRootNodes, state);
      dispatch(deleteMatchDialogError(nodeKeyToBeDeleted.nodeKey))
      dispatch(deleteNode({nodeKey: ''}));
    }
  }, [nodeKeyToBeDeleted]);

  // when the operator is changed we update the label of the node (AND/OR)
  useEffect(() => {
    const state = store.getState();
    if (operatorChanged && operatorChanged.nodeKey && operatorChanged.operator && rootNodes.length > 0) {
      const {nodeKey, operator, location} = operatorChanged;
      // console.log('operatorChanged: ', operatorChanged)
      if (location === 'form') {
        const parentNode = findArrayContainingKeyInsideATree(rootNodes[0], nodeKey as string);
        // operator to lower case and capitalize first letter
        const newOperator = operator.toLowerCase().charAt(0).toUpperCase() + operator.toLowerCase().slice(1);
        if (parentNode) {
          parentNode.label = newOperator;
        }
        updateReduxViewModelAndCtmlModel(rootNodes, state);
        setRootNodes([...rootNodes]);
      }

      if (location === 'tree') {
        const foundNode = findObjectByKeyInTree(rootNodes[0], nodeKey as string);
        // operator to lower case and capitalize first letter
        const newOperator = operator.toLowerCase().charAt(0).toUpperCase() + operator.toLowerCase().slice(1);
        if (foundNode) {
          foundNode.label = newOperator;
        }
        updateReduxViewModelAndCtmlModel(rootNodes, state);
        setRootNodes([...rootNodes]);
      }

    }
  }, [operatorChanged]);

  const tieredMenu = useRef(null);

  // This prop is set from MatchingMenuAndFormComponent
  useEffect(() => {
    if (rootNodesProp) {
      const {rootLabel, firstChildLabel} = rootNodesProp;
      if (rootLabel && firstChildLabel) {
        if (firstChildLabel === 'Empty Group') {
          const roodNodes = buildEmptyGroup(rootLabel);
          const firstSelectedKey = roodNodes[0].key;
          setRootNodes(roodNodes);
          setSelectedNode(roodNodes[0]);
          setSelectedKeys(firstSelectedKey)
          onTreeNodeClick(EComponentType.AndOROperator, roodNodes[0]);
        } else {
          const roodNodes = buildRootNodes(rootLabel, firstChildLabel);
          setRootNodesState(roodNodes);
        }
      }
    }
  }, [rootNodesProp]);

  const addCriteria = (nodeKey: string, type: string) => {
    if (nodeKey) {
      const parentNode = findArrayContainingKeyInsideATree(rootNodes[0], nodeKey as string);
      if (parentNode) {
        const key = uuidv4();
        const newNode = {
          key,
          label: type,
          icon: type === 'Clinical' ? 'clinical-icon in-tree' : 'genomic-icon in-tree',
          data: {type: type === 'Clinical' ? EComponentType.ClinicalForm : EComponentType.GenomicForm},
        }
        const payload = {[key]: true};
        dispatch(setMatchDialogErrors(payload))
        // find current index of the selected node
        const index = parentNode.children!.findIndex((child: any) => child.key === nodeKey);
        parentNode.children!.splice(index + 1, 0, newNode);
        setSelectedNode(newNode);
        setSelectedKeys(newNode.key as string)
        onTreeNodeClick(newNode.data.type, newNode);
      }
      setRootNodes([...rootNodes]);
    }
  }

  const addCriteriaToSameList = (nodeKey: string, type: string) => {
    if (nodeKey) {
      const parentNode = findObjectByKeyInTree(rootNodes[0], nodeKey as string);
      if (parentNode) {
        // get last element from the children
        const key = uuidv4();
        const newNode = {
          key,
          label: type,
          icon: type === 'Clinical' ? 'clinical-icon in-tree' : 'genomic-icon in-tree',
          data: {type: type === 'Clinical' ? EComponentType.ClinicalForm : EComponentType.GenomicForm},
        }
        const payload = {[key]: true};
        dispatch(setMatchDialogErrors(payload))
        parentNode.children!.unshift(newNode);
        // Ensure the parent node of this new leaf is expanded
        expandedKeys[parentNode.key] = true;
        setExpandedKeys(expandedKeys);

        setSelectedNode(newNode);
        setSelectedKeys(newNode.key as string)
        onTreeNodeClick(newNode.data.type, newNode);
      }

      setRootNodes([...rootNodes]);
    }
  }

  const addSubGroup = (nodeKey: string, label: string) => {
    if (nodeKey) {
      const parentNode = findObjectByKeyInTree(rootNodes[0], nodeKey as string);
      if (parentNode) {
        const newNode = {
          key: uuidv4(),
          label,
          icon: label === 'And' ? 'and-icon' : 'or-icon',
          data: {type: EComponentType.AndOROperator},
          children: []
        };
        parentNode.children!.unshift(newNode);
        expandedKeys[parentNode.key] = true;
        setExpandedKeys(expandedKeys);
      }
      setRootNodes([...rootNodes]);
    }
  }

  const tieredMenuClick = (e: any) => {
    // @ts-ignore
    tieredMenu.current.show(e);
  }

  const deleteNodeClicked = (nodeKey: string) => {
    if (nodeKey) {
      let keysRemoved: string[] = [];
      const newRootNodes = rootNodes;
      // before removing, find all the children keys and clear the errors
      // we track the names now so we can clear the errors, since the keys will be different or gone after modification of the tree
      const parentNode = findObjectByKeyInTree(rootNodes[0], nodeKey as string);
      if (parentNode) {
        keysRemoved = traverseNode(parentNode, nodeKey);
      }
      deleteNodeFromChildrenArrayByKey(newRootNodes[0], nodeKey);
      setRootNodes(newRootNodes);
      // After deleting a node, the new selected node should be chosen vertically.
      const defaultSelectedNode = getLastVerticalNode(newRootNodes);
      setSelectedNode(defaultSelectedNode);
      setSelectedKeys(defaultSelectedNode.key)
      onTreeNodeClick(defaultSelectedNode.data.type, defaultSelectedNode);
      // clear the errors from the previously tracked keys
      keysRemoved.forEach((key: string) => {
        dispatch(deleteMatchDialogError(key))
      });
      const state = store.getState();
      updateReduxViewModelAndCtmlModel(newRootNodes, state);
    }
  }

  // const moveCriteriaToAnyGroup = (nodeKey: string, destinationNodeKey: string) => {
  //   const newRootNodes = structuredClone(rootNodes);
  //   if (nodeKey && destinationNodeKey) {
  //     const foundNode = findObjectByKeyInTree(newRootNodes[0], nodeKey as string);
  //     if (foundNode) {
  //       const parentNode = findArrayContainingKeyInsideATree(newRootNodes[0], nodeKey as string);
  //       if (parentNode) {
  //         const index = parentNode.children!.findIndex((child: any) => child.key === nodeKey);
  //         // console.log('index: ', index)
  //         parentNode.children!.splice(index, 1);
  //         const targetNode = findObjectByKeyInTree(newRootNodes[0], destinationNodeKey as string);
  //         if (targetNode) {
  //           const key = uuidv4();
  //           const newNode = {
  //             key: key,
  //             label: foundNode.label,
  //             icon: foundNode.icon,
  //             data: foundNode.data,
  //             children: foundNode.children
  //           };
  //
  //           targetNode.children!.push(newNode);
  //           setRootNodes([...newRootNodes]);
  //
  //           // setSelectedNode(newNode);
  //           // setSelectedKeys(newNode.key as string)
  //           // onTreeNodeClick(newNode.data.type, newNode);
  //
  //           expandedKeys[targetNode.key] = true;
  //           // if moving a group, also expand the selected group as well so we can see the new alignment
  //           if (newNode.label === 'And' || newNode.label === 'Or') {
  //             expandedKeys[newNode.key] = true;
  //           }
  //           setExpandedKeys(expandedKeys);
  //
  //           const state = store.getState();
  //           updateReduxViewModelAndCtmlModel(newRootNodes, state);
  //           dispatch(moveNodeDnD({draggedNodeKey: nodeKey, destinationNodeKey: destinationNodeKey}));
  //         }
  //       }
  //     }
  //   }
  // }

  const onNodeClick = (node: TreeNode) => {
    // console.log('node: ', node)
    // const nodeKey = node.key;
    // const parentNode = findArrayContainingKeyInsideATree(rootNodes[0], nodeKey as string);
    // console.log('parentNode: ', parentNode)

    // if it's a genomic node, add variantCategoryContainerObject to it
    let newNode = {...node};
    if (newNode.label === 'Genomic') {
      if (newNode.data.formData && !newNode.data.formData.variantCategoryContainerObject) {
        const c = {variantCategoryContainerObject: newNode.data.formData};
        newNode.data.formData = c;
      }
    }
    setSelectedNode(newNode);
    setSelectedKeys(newNode.key as string)
    onTreeNodeClick(newNode.data.type, newNode);
  }

  const nodeTemplate = (node: TreeNode) => {

    const divRef = useRef<any>(null)

    if (selectedNode) {

      let label = <b>{node.label}</b>;

      const style: React.CSSProperties = {
        width: '50%',
        flexGrow: 0
      }

      if (matchDialogErrors[node.key as string]) {
        style['color'] = 'red';
      }

      // useEffect(() => {
      //   divRef.current.addEventListener('click', onNodeClick);
      // }, [divRef.current])

      // return a label according to the hierarchy defined by CTM-448
      const nodeLabel = (): any => {
        const isGroup = node.label === 'And' || node.label === 'Or';

        // scale the width to the depth of the tree, otherwise icon will be covered
        const width = 390 - ((node.data.depth - 1) * 16);

        const style: React.CSSProperties = {
          width: isGroup? '1px': `${width}px`,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'inline-block',
          textAlign: 'end',
          verticalAlign: 'bottom',
          height: '24px',
        }

        node.data.nodeLabel = getNodeLabel(node);
        return <i style={style} onClick={() => onNodeClick(node)}>{node.data.nodeLabel}</i>;
      }

      return (
        <>
          <div ref={divRef} className={styles.treeNodeContainer}>
              <span className="p-treenode-label" style={style}>
                {label}
              </span>

            {/*{btnToShow()}*/}
            {/*<TieredMenu model={tieredMenuModel} popup ref={tieredMenu}/>*/}
          </div>
          <div>{nodeLabel()}</div>
        </>
      );
    }
    return null;
  }

  const togglerTemplate = (node: TreeNode, defaultContentOptions: TreeTogglerTemplateOptions) => {
    const tieredMenuModel = [
      {
        label: 'Add criteria to same group',
        icon: 'pi pi-plus-circle',
        items: [
          {
            label: 'Clinical',
            command: () => {
              addCriteriaToSameList(selectedNode.key as string, 'Clinical');
            },
            icon: 'clinical-icon in-menu'
          },
          {
            label: 'Genomic',
            command: () => {
              addCriteriaToSameList(selectedNode.key as string, 'Genomic');
            },
            icon: 'genomic-icon in-menu',
          },
        ],
      },
      {
        label: 'Switch group operator',
        icon: 'pi pi-arrow-right-arrow-left',
        command: () => {
          if (selectedNode.label === 'And') {
            dispatch(operatorChange({nodeKey: selectedNode.key, operator: 'Or', location: 'tree'}));
          } else {
            dispatch(operatorChange({nodeKey: selectedNode.key, operator: 'And', location: 'tree'}));
          }
        }
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => { deleteNodeClicked(selectedNode.key) }
      },
      {
        separator:true
      },
      {
        label: 'Add criteria subgroup',
        icon: 'pi pi-clone',
        items: [
          {
            label: 'And (if all criteria are met)',
            icon: 'and-icon',
            command: () => { addSubGroup(selectedNode.key, 'And') }
          },
          {
            label: 'Or (if any criteria is met)',
            icon: 'or-icon',
            command: () => { addSubGroup(selectedNode.key, 'Or') }
          }
        ],
      }
    ]

    const expanded = defaultContentOptions.expanded;
    const iconClassName = classNames('p-tree-toggler-icon pi pi-fw', { 'caret-right-filled': !expanded, 'caret-down-filled': expanded });

    const btnToShow = () => {
      let show = false;
      let isGroup = false;
      // we only display the three dots menu over the node if the node is selected and the mouse is over the node and the node is not a leaf
      if ((selectedNode as TreeNode).key === node.key && (node.label === 'And' || node.label === 'Or')) {
        show = true;
      }
      if (node.label === 'And' || node.label === 'Or') {
        isGroup = true;
      }
      let nodeClickDivWidth = '0%';
      if (isGroup) {
        nodeClickDivWidth = '70%';
        if (!show) {
          nodeClickDivWidth = '100%';
        }
      }
      return (
        <>
          <div onClick={() => onNodeClick(node)} style={{order: 2, width: nodeClickDivWidth, height: '24px'}}></div>
          {show ?
            <Button icon="pi pi-ellipsis-h"
                    className={styles.treeMenuBtn}
                    style={{order: 2, height: 'auto'}}
                    iconPos="right" onClick={tieredMenuClick}></Button> : null
          }
        </>
      )
    }

    return (
      <>
        {btnToShow()}
        <button type="button" className="p-tree-toggler p-link" tabIndex={-1}
                style={{order: 1}}
                onClick={defaultContentOptions.onClick}>
          <span className={iconClassName} aria-hidden="true"></span>
        </button>
        <TieredMenu model={tieredMenuModel} popup ref={tieredMenu}/>
      </>
    )
  }

  const onNodeToggle = (e: any) => {
    // console.log('selectedKeys', selectedKeys);
    setExpandedKeys(e.value)
  }

  const onDragDropEvent = (e: TreeDragDropParams) => {
    const {dragNode, dropNode} = e;
    // check it's dropping into a group, ie. not dropped outside of topmost node
    if (!dropNode) {
      return;
    }

    // cannot drop into another leaf node
    if (dropNode.label === 'Clinical' || dropNode.label === 'Genomic') {
      return;
    }
    // if (isSortedChecked) {
    //   // check if dropping into a group
    //   if (dropNode.data.type === EComponentType.AndOROperator || dropNode.data.type === undefined) {
    //     moveCriteriaToAnyGroup(dragNode.key as string, dropNode.key as string)
    //   } else {
    //     // if the drop node is a leaf, move to the parent group
    //     const parentNode = findArrayContainingKeyInsideATree(rootNodes[0], dropNode.key as string);
    //     if (parentNode) {
    //       moveCriteriaToAnyGroup(dragNode.key as string, parentNode.key as string)
    //     }
    //   }
    // } else {
      setRootNodes(e.value)
      const state = store.getState();
      updateReduxViewModelAndCtmlModel(e.value, state);
      dispatch(moveNodeDnD({draggedNodeKey: dragNode.key as string, destinationNodeKey: dropNode.key as string}));
    // }
    // set the node as clicked so the left menu and right form is synced
    setSelectedNode(dragNode);
    setSelectedKeys(dragNode.key as string)
    onTreeNodeClick(dragNode.data.type, dragNode);
  }

  const handleIsSortedChecked = (value: boolean) => {
    dispatch(setIsSortEnabled(value));
    if (rootNodes.length > 0) {
      setRootNodes([...rootNodes]);
    }
  }

  return (
    <div className={styles.matchingCriteriaMenuContainer}>
      <div className={styles.matchingCriteriaTextContainer}>
        <div className={styles.matchingCriteriaText}>Matching Criteria</div>
        <div className={styles.matchingCriteriaSortContainer}>
          Sort
          <ToggleButton onLabel="On" offLabel="Off"
                        checked={isSortedChecked} onChange={(e) => handleIsSortedChecked(e.value)}
                        className={styles.matchingCriteriaToggle}/>
        </div>

      </div>
      <Tree
        value={rootNodes}
        className="ctims-tree"
        contentClassName="ctims-tree-content"
        nodeTemplate={nodeTemplate}
        togglerTemplate={togglerTemplate}
        expandedKeys={expandedKeys}
        selectionKeys={selectedKeys}
        selectionMode="single"
        dragdropScope="leftMenuScope"
        onDragDrop={(event) => onDragDropEvent(event)}
        onToggle={(e) => onNodeToggle(e)}
      />
    </div>
  );

}, (prevProps, nextProps) => {
  return false;
});
export default LeftMenuComponent;
