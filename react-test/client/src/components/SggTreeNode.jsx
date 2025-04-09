import React, { useState, useMemo, useEffect } from 'react';
import styles from '@css/SggTreeNode.module.css';

const SggTree = ({
    node,
    depth = 0,
    onSelect,
    children,
    selectedNode,
    onNodeSelect,
    notFold,
    onDropNode
}) => {
    const [expanded, setExpanded] = useState(children && children.length > 0);

    const handleClick = () => {
        if (notFold) {
            setExpanded(true);
        } else if (children && children.length > 0) {
            setExpanded(!expanded);
        }
        onNodeSelect?.(node);
    };

    const handleDragStart = (e) => {
        e.dataTransfer.setData("application/node-id", node.id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const draggedNodeId = e.dataTransfer.getData("application/node-id");
        if (draggedNodeId && draggedNodeId !== node.id) {
            onDropNode?.(draggedNodeId, node.id, node);
        }
    };

    const isSelected = selectedNode?.id === node.id;

    return (
        <div
            style={{ paddingLeft: depth * 32 }}
            className={styles.treeNode}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div
                className={`${styles.nodeLabel} ${isSelected ? styles.selected : ''}`}
                onClick={handleClick}
                draggable
                onDragStart={handleDragStart}
            >
                <span className={styles.nodeIcon}>
                    {children && children.length > 0 ? '📂' : node.upId ? '📄' : '📁'}
                </span>
                <span className={styles.nodeTitle}>{node.showTitle}</span>
                <span className={styles.nodePath}>{node.path}</span>
            </div>

            {children && children.length > 0 && expanded && (
                <div>
                    {children.map((child) => (
                        <SggTree
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            onSelect={onSelect}
                            children={child.children}
                            selectedNode={selectedNode}
                            onNodeSelect={onNodeSelect}
                            notFold={notFold}
                            onDropNode={onDropNode}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const transformDataToTree = (data) => {
    const map = new Map();
    const roots = [];

    data.forEach((item) => {
        map.set(item.id, { ...item, children: [] });
    });

    data.forEach((item) => {
        const node = map.get(item.id);
        if (item.upId === null || !map.has(item.upId)) {
            roots.push(node);
        } else {
            const parent = map.get(item.upId);
            parent.children.push(node);
        }
    });

    return roots;
};

const SggTreeNode = ({ data, setData, onSelect, diSelect, notFold }) => {
    const [selectedNode, setSelectedNode] = useState(null);
    const [treeData, setTreeData] = useState(data);

    useEffect(() => {
        setTreeData(data);
    }, [data]);

    useEffect(() => {
        setData(treeData);
    }, [treeData])

    const handleNodeSelect = (node) => {
        setSelectedNode(node);
        onSelect?.(node);
    };

    useEffect(() => {
        if (diSelect) setSelectedNode(null);
    }, [diSelect]);

    const handleDropNode = (draggedId, dropTargetId, node) => {
        const draggedNode = treeData.find((n) => n.id === draggedId);
        const dropTargetNode = treeData.find((n) => n.id === dropTargetId);

        if (!draggedNode || !dropTargetNode) return;

        const newTree = [...treeData];
        const draggedIndex = newTree.findIndex((n) => n.id === draggedId);
        newTree.splice(draggedIndex, 1);

        const newParentId = dropTargetNode.id;
        const sameParent = draggedNode.upId === dropTargetNode.upId;

        if (sameParent) {
            // 같은 부모 내에서 순서만 변경
            const siblingIndexes = newTree.reduce((acc, node, i) => {
                if (node.upId === draggedNode.upId) acc.push(i);
                return acc;
            }, []);

            const dropIndex = newTree.findIndex((n) => n.id === dropTargetId);
            newTree.splice(dropIndex + 1, 0, { ...draggedNode });
        } else {
            // 부모도 바꾸고 drop 아래로 이동
            const dropIndex = newTree.findIndex((n) => n.id === dropTargetId);
            newTree.splice(dropIndex + 1, 0, {
                ...draggedNode,
                upId: newParentId,
            });
        }

        node.upId ? onSelect?.({ ...draggedNode, upId: newParentId }) : onSelect?.(draggedNode);
        setTreeData(newTree);
    };

    const treeStructure = useMemo(() => transformDataToTree(treeData), [treeData]);

    return (
        <div className={styles.treeContainer}>
            {treeStructure.map((node) => (
                <SggTree
                    key={node.id}
                    node={node}
                    onSelect={onSelect}
                    children={node.children}
                    selectedNode={selectedNode}
                    onNodeSelect={handleNodeSelect}
                    notFold={notFold}
                    onDropNode={handleDropNode}
                />
            ))}
        </div>
    );
};

export default SggTreeNode;
