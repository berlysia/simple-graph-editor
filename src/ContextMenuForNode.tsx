import { useRef, useState } from "react";
import Dialog from "./Dialog";

// ノードを右クリックしたときのメニューを表示するコンポーネント
export default function ContextMenu({
  nodeId,
  onRemoveNode,
  onRenameNode,
  onConnectLine,
  onClose,
}: {
  nodeId: number | null;
  onRemoveNode: (nodeId: number) => void;
  onRenameNode: (nodeId: number, label: string) => void;
  onConnectLine: (nodeId: number) => void;
  onClose: () => void;
}) {
  const handleRemoveNode = () => {
    typeof nodeId === "number" && onRemoveNode(nodeId);
    onClose();
  };

  const handleRenameNode = () => {
    const label = window.prompt("Enter new label");
    if (typeof nodeId === "number" && label) {
      onRenameNode(nodeId, label);
    }
    onClose();
  };

  const handleConnectLine = () => {
    typeof nodeId === "number" && onConnectLine(nodeId);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={typeof nodeId === "number"}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: 10,
        }}
      >
        <div>node: {nodeId}</div>
        <div>
          <button onClick={handleRemoveNode}>Remove Node</button>
          <button onClick={handleRenameNode}>Rename Node</button>
          <button
            onClick={() => {
              handleConnectLine();
              onClose();
            }}
          >
            Connect Line
          </button>
        </div>
      </div>
    </Dialog>
  );
}
