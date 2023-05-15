import React, { useState, useEffect, useRef } from "react";

export default function Dialog({
  children,
  onClose,
  open,
}: {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        display: open ? "block" : "none",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
