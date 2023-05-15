import { useRef, useState } from "react";
import Dialog from "./Dialog";

type LinkId = { from: number; to: number };

// ノードを右クリックしたときのメニューを表示するコンポーネント
export default function ContextMenuForLink({
  linkId,
  onRemoveLink,
  onReverseLink,
  onClose,
}: {
  linkId: LinkId | null;
  onRemoveLink: (linkId: LinkId) => void;
  onReverseLink: (linkId: LinkId) => void;
  onClose: () => void;
}) {
  const handleRemoveLink = () => {
    linkId && onRemoveLink(linkId);
    onClose();
  };

  const handleReverseLink = () => {
    linkId && onReverseLink(linkId);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={!!linkId}>
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
        <div>
          link: {linkId?.from} -&gt; {linkId?.to}
        </div>
        <div>
          <button onClick={handleRemoveLink}>Remove Link</button>
          <button onClick={handleReverseLink}>Reverse Link</button>
        </div>
      </div>
    </Dialog>
  );
}
