import React, {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type GraphNodeRef = {
  setPosition: (position: { x: number; y: number }) => void;
  getPosition: () => { x: number; y: number };
};

export const GraphNode = forwardRef(function GraphNode(
  {
    label,
    nodeId,
    selected,
    onRightClick,
    onLeftClick,
    onMove,
    fieldRef,
  }: {
    label: string;
    nodeId: number;
    selected: boolean;
    onRightClick: (nodeId: number) => void;
    onLeftClick: (nodeId: number) => void;
    onMove: (nodeId: number, position: { x: number; y: number }) => void;
    fieldRef: React.RefObject<HTMLDivElement>;
  },
  forwardedRef: React.Ref<GraphNodeRef>
) {
  // ドラッグアンドドロップで親要素の中を移動するコンポーネント
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      // 初期位置は要素の中心座標
      setPosition({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsDragging(true);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isDragging) {
      // 親要素の中での座標にするために、親要素の位置を引く
      if (fieldRef.current) {
        const fieldRect = fieldRef.current.getBoundingClientRect();
        const position = {
          x: e.clientX - fieldRect.x,
          y: e.clientY - fieldRect.y,
        };

        setPosition(position);
        onMove(nodeId, position);
      }
    }
  };

  useLayoutEffect(() => {
    if (forwardedRef) {
      if (typeof forwardedRef === "function") {
        forwardedRef({ setPosition, getPosition: () => position });
      } else {
        // @ts-expect-error
        forwardedRef.current = { setPosition };
      }
    }
  }, [forwardedRef]);

  useEffect(() => {
    // @ts-expect-error
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      // @ts-expect-error
      document.removeEventListener("mousemove", handleMouseMove, {
        passive: true,
      });
    };
  }, [isDragging]);

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => {
        e.preventDefault();
        onRightClick(nodeId);
      }}
      onClick={() => {
        onLeftClick(nodeId);
      }}
      style={{
        position: "absolute",
        // positionの位置を要素の中心にするために、要素の大きさの半分を引く
        left: position.x - 50,
        top: position.y - 50,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: selected ? "blue" : "red",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        userSelect: "none",
      }}
    >
      {label}#{nodeId}
    </div>
  );
});
export type GraphNodeProps = {
  label: string;
  nodeId: number;
};
