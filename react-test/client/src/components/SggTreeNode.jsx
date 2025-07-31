import React, { useState, useMemo, useEffect } from 'react';
import styles from '@css/SggTreeNode.module.css';

// 재귀적으로 노드를 렌더링하는 컴포넌트
const SggTree = ({
    node,
    depth = 0,
    showCol,
    onSelect,
    children,
    selectedNode,
    onNodeSelect,
    alwaysOpen,
    onDropNode
}) => {
    // 노드 확장 상태 관리
    const [expanded, setExpanded] = useState(children && children.length > 0);

    // 노드 클릭 시 확장/축소 또는 선택 처리
    const handleClick = () => {
        if (alwaysOpen) {
            setExpanded(true);
        } else if (children && children.length > 0) {
            setExpanded(!expanded);
        }
        onNodeSelect?.(node);
    };

    // 드래그 시작 시 노드 ID 저장
    const handleDragStart = (e) => {
        e.dataTransfer.setData("application/node-id", node.id);
    };

    // 드래그 오버 시 기본 동작 막기 (drop 허용)
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // 노드 위에 드롭했을 때 처리
    const handleDrop = (e) => {
        e.preventDefault();
        const draggedNodeId = e.dataTransfer.getData("application/node-id");
        if (draggedNodeId && draggedNodeId !== node.id) {
            onDropNode?.(draggedNodeId, node.id);
        }
    };

    const isSelected = selectedNode?.id === node.id;

    return (
        <>
        {!node.hideNode && 
            <div
                style={{ paddingLeft: depth * 16 }} // 깊이에 따라 들여쓰기
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
                    {/* 아이콘 표시 */}
                    <span className={styles.nodeIcon}>
                        {node.delNode ? '❌' : children && children.length > 0 ? '📂' : node.upId ? '📄' : '📁'}
                    </span>
                    {/* 노드 제목과 경로 */}
                    {showCol && showCol.map((item, idx) => <span className={idx === 0 ? styles.nodeTitle : styles.nodePath} key={'tree' + item}>{node[item]}</span>)}
                </div>

                {/* 자식 노드 재귀 렌더링 */}
                {children && children.length > 0 && expanded && (
                    <div>
                        {children.map((child) => (
                            <SggTree
                            key={child.id}
                            node={child}
                            showCol={showCol}
                            depth={depth + 1}
                            onSelect={onSelect}
                            children={child.children}
                            selectedNode={selectedNode}
                            onNodeSelect={onNodeSelect}
                            alwaysOpen={alwaysOpen}
                            onDropNode={onDropNode}
                            />
                        ))}
                    </div>
                )}
            </div>
        }
        </>
    );
};

// flat한 리스트를 트리 구조로 변환
const transformDataToTree = (data) => {
    const map = new Map();
    const roots = [];

    // 모든 항목을 Map에 등록하고 자식 배열 초기화
    data.forEach((item) => {
        map.set(item.id, { ...item, children: [] });
    });

    // 부모-자식 관계 구성
    data.forEach((item) => {
        const node = map.get(item.id);
        if (item.upId === null || !map.has(item.upId)) {
            roots.push(node); // 루트 노드
        } else {
            const parent = map.get(item.upId);
            parent.children.push(node); // 부모의 자식 배열에 추가
        }
    });

    return roots;
};

// 트리 컴포넌트 전체 컨트롤러
const SggTreeNode = ({ showCol, data, setData, onSelect, diSelect, alwaysOpen }) => {
    const [selectedNode, setSelectedNode] = useState(null);
    const [treeData, setTreeData] = useState(data);
    const [newId, setNewId] = useState(1);

    // 외부 data가 변경되면 반영
    useEffect(() => {
        setTreeData(data);
    }, [data]);

    // 내부 treeData가 변경되면 부모로 전달
    useEffect(() => {
        setData(treeData);
    }, [treeData]);

    // 노드 선택 핸들러
    const handleNodeSelect = (node) => {
        setSelectedNode(node);
        onSelect?.(node);
    };

    // 선택 해제 트리거
    useEffect(() => {
        if (diSelect) setSelectedNode(null);
    }, [diSelect]);

    // 노드 드롭 처리
    const handleDropNode = (draggedId, dropTargetId) => {
        const draggedNode = treeData.find((n) => n.id === draggedId);
        const dropTargetNode = treeData.find((n) => n.id === dropTargetId);

        if (!draggedNode || !dropTargetNode) return;

        const newTree = [...treeData];
        const draggedIndex = newTree.findIndex((n) => n.id === draggedId);
        newTree.splice(draggedIndex, 1); // 기존 위치 제거

        const newParentId = dropTargetNode.id;
        const sameParent = draggedNode.upId === dropTargetNode.upId;

        if (sameParent) {
            // 같은 부모 내에서 위치 이동
            const dropIndex = newTree.findIndex((n) => n.id === dropTargetId);
            newTree.splice(dropIndex + 1, 0, { ...draggedNode });
        } else {
            // 부모 변경 후 새 위치로 이동
            const dropIndex = newTree.findIndex((n) => n.id === dropTargetId);
            newTree.splice(dropIndex + 1, 0, {
                ...draggedNode,
                upId: newParentId,
            });
        }

        setSelectedNode(draggedNode);

        // 선택된 노드 콜백
        draggedNode.upId ? (onSelect?.({ ...draggedNode, upId: newParentId })) : onSelect?.(draggedNode);

        setTreeData(newTree);
    };

    // 트리 구조 데이터 생성
    const treeStructure = useMemo(() => transformDataToTree(treeData), [treeData]);
    
    // 행추가
	const addTreeNode = () => {
        const newData = structuredClone(data);
        const newObj = {};
        for (const item of showCol) {
            newObj[item] = '';
		}
        newObj.id = newId;
        newObj.newNode = 'Y';
        setNewId(newId + 1);
        
        if (selectedNode) {
  			const id = selectedNode.id;
            newObj.upId = id;          
		}
        
        newData.push(newObj);
        setTreeData(newData);
    }
    
    // 행삭제
	const deleteTreeNode = () => {
        const newData = structuredClone(data);
        const id = selectedNode.id;
        
        for (let i = newData.length - 1; i >= 0; i--) {
            if (newData[i].id === id) {
                if (newData[i].newNode) {
                    newData.splice(i, 1);
                } else {
                    newData[i].delNode = 'Y';
                }
            }
            
            if (newData[i]?.upId === id) {
                const upId = newData[i].id;
                delNode(newNode, upId);
                if (newData[i].newNode) {
                    newData.splice(i, 1);
                } else {
                    newData[i].delNode = 'Y';
                }
            }
        }
        
        setTreeData(newData);
    }
    
    const delNode = (data, id) => {
        for (let i = data.length - 1; i >= 0; i--) {
            if (data[i]?.upId === id) {
                const upId = data[i].id;
                delNode(data, upId);
                if (data[i]].newNode) {
                    data.splice(i, 1);
                } else {
                    data[i.delNode = 'Y';
                }
            }
        }
    }

    return (
        <div className={styles.treeContainer}>
            {treeStructure.map((node) => (
                <SggTree
                    key={node.id}
                    node={node}
                    showCol={showCol}
                    onSelect={onSelect}
                    children={node.children}
                    selectedNode={selectedNode}
                    onNodeSelect={handleNodeSelect}
                    alwaysOpen={alwaysOpen}
                    onDropNode={handleDropNode}
                />
            ))}
        </div>
    );
};

export default SggTreeNode;
