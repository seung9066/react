import React, { useState, useMemo, useEffect } from 'react';
import styles from '@css/SggTreeNode.module.css';

/**
 * SggTree 컴포넌트 - 개별 노드를 렌더링
 *
 * @param {object} node - 현재 노드 데이터
 * @param {number} depth - 트리 깊이 (들여쓰기 기준)
 * @param {function} onSelect - 노드 클릭 시 호출할 콜백 함수
 * @param {array} children - 자식 노드 배열
 * @param {object} selectedNode - 현재 선택된 노드
 * @param {function} onNodeSelect - 선택 상태 업데이트 콜백
 */
const SggTree = ({ node, depth = 0, onSelect, children, selectedNode, onNodeSelect, notFold }) => {
    // 자식이 있다면 기본적으로 펼친 상태로 초기화
    const [expanded, setExpanded] = useState(children && children.length > 0);

    const handleClick = () => {
        if (notFold) {
            setExpanded(true);
        } else {
            // 자식이 있을 경우 확장 상태 토글
            if (children && children.length > 0) {
                setExpanded(!expanded);
            }
        }

        // 선택 노드 상태 업데이트
        onNodeSelect?.(node);
    };

    const isSelected = selectedNode?.id === node.id;

    return (
        <div style={{ paddingLeft: depth * 32 }} className={styles.treeNode}>
            <div
                className={`${styles.nodeLabel} ${isSelected ? styles.selected : ''}`}
                onClick={handleClick}
            >
                <span className={styles.nodeIcon}>
                    {children && children.length > 0
                        ? '📂' // 폴더 아이콘
                        : node.upId
                        ? '📄' // 파일 아이콘
                        : '📁' // 루트 아이콘 
                    }
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
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * transformDataToTree - 평면 구조 데이터를 트리 구조로 변환
 *
 * @param {array} data - 평면 구조의 데이터 (id, upId 포함)
 * @returns {array} 트리 구조의 루트 노드 배열
 */
const transformDataToTree = (data) => {
    const map = new Map();
    const roots = [];

    // 각 노드를 Map에 등록하고 children 초기화
    data.forEach((item) => {
        map.set(item.id, { ...item, children: [] });
    });

    // 부모-자식 관계 설정
    data.forEach((item) => {
        const node = map.get(item.id);
        if (item.upId === null || !map.has(item.upId)) {
            // 부모가 없으면 루트 노드로 간주
            roots.push(node);
        } else {
            const parent = map.get(item.upId);
            parent.children.push(node);
        }
    });

    return roots;
};

/**
 * SggTreeNode - 전체 트리를 렌더링하는 루트 컴포넌트
 *
 * @param {array} data - 평면 구조의 데이터 배열
 * @param {function} onSelect - 노드 선택 시 실행할 콜백 함수
 */
const SggTreeNode = ({ data, onSelect, diSelect, notFold }) => {
    const [selectedNode, setSelectedNode] = useState(null); // 선택된 노드 상태

    // 트리 구조로 변환된 데이터를 메모이제이션
    const treeData = useMemo(() => transformDataToTree(data), [data]);

    // 노드 선택 처리
    const handleNodeSelect = (node) => {
        setSelectedNode(node);
        onSelect?.(node);
    };

    useEffect(() => {
        diSelect ? setSelectedNode() : null;
    }, [diSelect])

    return (
        <div className={styles.treeContainer}>
            {treeData.map((node) => (
                <SggTree
                    key={node.id}
                    node={node}
                    onSelect={onSelect}
                    children={node.children}
                    selectedNode={selectedNode}
                    onNodeSelect={handleNodeSelect}
                    notFold={notFold}
                />
            ))}
        </div>
    );
};

export default SggTreeNode;
