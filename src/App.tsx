import React, { Fragment, useReducer, useRef, useState } from "react";
import { GraphNodeProps, GraphNode, GraphNodeRef } from "./GraphNode";
import ContextMenuForNode from "./ContextMenuForNode";
import ContextMenuForLink from "./ContextMenuForLink";

// 2点間の角度を求める
const getAngle = (
  from: { x: number; y: number },
  to: { x: number; y: number }
) => {
  return Math.atan2(to.y - from.y, to.x - from.x);
};

function App() {
  const fieldRef = useRef<HTMLDivElement>(null);

  // 強制rerender関数
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // GraphNodeのIDを管理する
  const [counter, countup] = useReducer((x) => x + 1, 0);

  // GraphNodeを可変個管理する
  const [nodes, setNodes] = useState<GraphNodeProps[]>([]);

  // GraphNodeへの参照を保持する
  const [nodeRefs] = useState<Map<number, GraphNodeRef>>(() => new Map());

  const [labelValue, setLabelValue] = useState("");

  // GraphNodeの間に線を引く
  const [lines, setLines] = useState<{ from: number; to: number }[]>([]);
  const [lineFrom, setLineFrom] = useState<number | null>(null);

  const onStartConnectLine = (nodeId: number) => {
    console.log("startConnectLine", { nodeId, lineFrom });
    if (typeof nodeId === "number" && nodeId === lineFrom) {
      setLineFrom(null);
      return;
    }
    setLineFrom(nodeId);
  };

  const onConnectLine = (nodeId: number) => {
    if (lineFrom === null) {
      return;
    }
    setLines([...lines, { from: lineFrom, to: nodeId }]);
    setLineFrom(null);
  };

  // ノードを消すコールバック
  const onRemoveNode = (nodeId: number) => {
    setNodes(nodes.filter((node) => node.nodeId !== nodeId));
    setLines(
      lines.filter((line) => line.from !== nodeId && line.to !== nodeId)
    );
  };

  // ノードをリネームするコールバック
  const onRenameNode = (nodeId: number, label: string) => {
    setNodes(
      nodes.map((node) => {
        if (node.nodeId === nodeId) {
          return { ...node, label };
        }
        return node;
      })
    );
  };

  // リンクを消すコールバック
  const onRemoveLink = ({ from, to }: { from: number; to: number }) => {
    setLines(lines.filter((line) => line.from !== from || line.to !== to));
  };

  // リンクを反転するコールバック
  const onReverseLink = ({ from, to }: { from: number; to: number }) => {
    setLines(
      lines.map((line) =>
        line.from === from && line.to === to ? { from: to, to: from } : line
      )
    );
  };

  // コンテキストメニューを開いているノードID
  const [contextMenuNodeId, setContextMenuNodeId] = useState<number | null>(
    null
  );

  // コンテキストメニューをノードに対して開くコールバック
  const onOpenContextMenuNode = (nodeId: number) => {
    setContextMenuNodeId(nodeId);
  };

  // コンテキストメニューを閉じるコールバック
  const onCloseContextMenuNode = () => {
    setContextMenuNodeId(null);
  };

  // コンテキストメニューを開いているリンクID
  const [contextMenuLinkId, setContextMenuLinkId] = useState<{
    from: number;
    to: number;
  } | null>(null);

  // コンテキストメニューをリンクに対して開くコールバック
  const onOpenContextMenuLink = (line: { from: number; to: number }) => {
    setContextMenuLinkId(line);
  };

  // コンテキストメニューを閉じるコールバック
  const onCloseContextMenuLink = () => {
    setContextMenuLinkId(null);
  };

  return (
    <div>
      <div>
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            value={labelValue}
            onChange={(e) => {
              setLabelValue(e.target.value);
            }}
          />
          <button
            onClick={() => {
              setNodes([...nodes, { label: labelValue, nodeId: counter }]);
              countup();
              setLabelValue("");
            }}
          >
            Add Node
          </button>
        </form>
        <button
          onClick={() => {
            // 半径はノード数に応じて広がる
            const radius = 100 + 10 * nodes.length;

            // ウィンドウの中心を原点とする
            const center = {
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
            };

            const angle = (2 * Math.PI) / nodes.length;
            nodes.forEach((node, i) => {
              const x = center.x + radius * Math.cos(angle * i);
              const y = center.y + radius * Math.sin(angle * i);
              nodeRefs.get(node.nodeId)?.setPosition({ x, y });
            });
            forceUpdate();
          }}
        >
          Arrange Nodes
        </button>
        {/* ノードをすべて消す */}
        <button
          onClick={() => {
            setNodes([]);
            setLines([]);
          }}
        >
          Clear
        </button>
      </div>
      <div>
        <textarea
          value={
            /*
              1行目はノードのラベルを表す
              2行目と3行目はインデックスで対応関係にあり、2行目がfrom、3行目がtoを表す
            */
            [
              nodes.map((node) => node.label),
              // fromはnodeIdなのでインデックスに変換する
              lines.map((line) =>
                nodes.findIndex((x) => x.nodeId === line.from)
              ),
              // toはnodeIdなのでインデックスに変換する
              lines.map((line) => nodes.findIndex((x) => x.nodeId === line.to)),
            ].join("\n")
          }
          readOnly
          style={{ height: "3em" }}
        />
      </div>
      <div ref={fieldRef} style={{ position: "relative" }}>
        {nodes.map((node) => (
          <GraphNode
            ref={(x) =>
              x ? nodeRefs.set(node.nodeId, x) : nodeRefs.delete(node.nodeId)
            }
            selected={lineFrom === node.nodeId}
            onRightClick={onOpenContextMenuNode}
            onLeftClick={onConnectLine}
            onMove={
              // ノードを移動したときに線を引き直す
              (nodeId) => {
                forceUpdate();
              }
            }
            key={node.nodeId}
            nodeId={node.nodeId}
            label={node.label}
            fieldRef={fieldRef}
          />
        ))}
        {lines.map((line) => {
          const fromRaw = nodeRefs.get(line.from)?.getPosition();
          const toRaw = nodeRefs.get(line.to)?.getPosition();
          if (!fromRaw || !toRaw) {
            return null;
          }

          // fromRawからtoRawへの角度を求める
          const angle = getAngle(fromRaw, toRaw);

          // fromRawからtoRawへのベクトルを求める
          const vector = {
            x: toRaw.x - fromRaw.x,
            y: toRaw.y - fromRaw.y,
          };

          // fromRawからtoRawへのベクトルの長さを求める
          const length = Math.sqrt(vector.x ** 2 + vector.y ** 2);

          // fromRawからtoRawへのベクトルの単位ベクトルを求める
          const unitVector = {
            x: vector.x / length,
            y: vector.y / length,
          };

          // fromRawからtoRawへのベクトルの単位ベクトルに対して、
          // GraphNodeの半径分だけずらした位置をfromとする
          const from = {
            x: fromRaw.x + unitVector.x * 50,
            y: fromRaw.y + unitVector.y * 50,
          };

          // fromRawからtoRawへのベクトルの単位ベクトルに対して、
          // GraphNodeの半径分だけずらした位置をtoとする
          const to = {
            x: toRaw.x - unitVector.x * 50,
            y: toRaw.y - unitVector.y * 50,
          };

          return (
            <Fragment key={`${line.from}-${line.to}`}>
              <div
                onClick={() => onRemoveLink(line)}
                onContextMenu={() => onOpenContextMenuLink(line)}
                style={{
                  position: "absolute",
                  border: "1px solid black",
                  backgroundColor: "black",
                  transformOrigin: "0 0",
                  transform: `rotate(${Math.atan2(
                    to.y - from.y,
                    to.x - from.x
                  )}rad)`,
                  width: Math.sqrt((from.x - to.x) ** 2 + (from.y - to.y) ** 2),
                  height: "3px",
                  left: from.x,
                  top: from.y,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  backgroundColor: "transparent",
                  borderTop: "3px solid black",
                  borderRight: "3px solid black",
                  transformOrigin: "center",
                  transform: `rotate(${angle + (1 / 4) * Math.PI}rad)`,
                  width: 10,
                  height: 10,
                  left: to.x - 5,
                  top: to.y - 5,
                }}
              />
            </Fragment>
          );
        })}
      </div>
      <ContextMenuForNode
        nodeId={contextMenuNodeId}
        onRemoveNode={onRemoveNode}
        onRenameNode={onRenameNode}
        onConnectLine={onStartConnectLine}
        onClose={onCloseContextMenuNode}
      />
      <ContextMenuForLink
        linkId={contextMenuLinkId}
        onRemoveLink={onRemoveLink}
        onReverseLink={onReverseLink}
        onClose={onCloseContextMenuLink}
      />
    </div>
  );
}

export default App;
