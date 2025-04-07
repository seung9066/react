import React, { useState, useMemo } from 'react';
import styles from '@css/SggTreeNode.module.css';

/**
 * 개별 트리 노드 컴포넌트
 * @param {object} node - 트리 항목 데이터
 * @param {number} depth - 트리의 깊이 (들여쓰기 계산용)
 * @param {function} onSelect - 노드 클릭 시 호출할 콜백 함수
 */
const SggTree = ({ node, depth = 0, onSelect, children, upId }) => {
    const [expanded, setExpanded] = useState(false); // 노드의 확장 여부 상태

    // 노드 클릭 시, 자식이 있으면 확장/축소 상태 토글, 부모 컴포넌트로 선택된 노드 전달
    const handleClick = () => {
        // 자식이 있을 때만 확장/축소 토글
        if (children && children.length > 0) {
            setExpanded(!expanded);
        }
        onSelect?.(node); // 부모에서 콜백이 있으면 노드 데이터 전달
    };

    return (
        <div
            className={styles.treeNode}
            style={{ paddingLeft: depth * 16 }} // 트리 깊이에 따라 들여쓰기
        >
            <div className={styles.nodeLabel} onClick={handleClick}>
                <span className={styles.nodeIcon}>
                    {children && children.length > 0
                        ? '📂' : node.upId 
                                ? '📄' : '📁'} {/* 최상위면 폴더 아이콘, 최하위는 파일 아이콘 */}
                </span>
                <span className={styles.nodeTitle}>{node.showTitle}</span> {/* 노드 제목 */}
                <span className={styles.nodePath}>{node.path}</span> {/* 노드 경로 */}
            </div>
            {children && children.length > 0 && expanded && ( // 자식 노드가 있을 때만 렌더링
                <div>
                    {children.map((child) => (
                        <SggTree key={child.id} node={child} depth={depth + 1} onSelect={onSelect} children={child.children} />
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * 트리 데이터 변환 함수
 * @param {Array} data - 평면화된 트리 데이터
 * @returns {Array} - 트리 구조로 변환된 데이터
 */
const transformDataToTree = (data) => {
    const map = new Map();
    const roots = [];

    // 평면 데이터를 Map에 넣고, children 배열을 초기화
    data.forEach((item) => {
        map.set(item.id, { ...item, children: [] });
    });

    // 각 노드에 대해 upId를 기준으로 부모-자식 관계 설정
    data.forEach((item) => {
        const currentNode = map.get(item.id);
        if (item.upId === null) {
            roots.push(currentNode); // upId가 null인 노드는 루트로 추가
        } else {
            const parent = map.get(item.upId);
            if (parent) {
                parent.children.push(currentNode); // 부모 노드에 자식 추가
            }
        }
    });

    return roots;
};

/**
 * 트리 전체를 렌더링하는 컴포넌트
 * @param {Array} data - 트리 데이터 (평면화된 형태)
 * @param {function} onSelect - 노드 클릭 시 실행되는 콜백 함수
 */
const SggTreeNode = ({ data, onSelect }) => {
    const treeData = useMemo(() => transformDataToTree(data), [data]);

    return (
        <div className={styles.treeContainer}>
            {treeData.map((node) => (
                <SggTree key={node.id} node={node} onSelect={onSelect} children={node.children} />
            ))}
        </div>
    );
};

export default SggTreeNode;
