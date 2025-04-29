import { useEffectEvent } from "@react-aria/utils";
import { move, MoveEvents } from "@window-splitter/interface";
import { useMemo } from "react";

export function useMove({ onMoveStart, onMove, onMoveEnd }: MoveEvents) {
  const onMoveStartEvent = useEffectEvent(onMoveStart);
  const onMoveEvent = useEffectEvent(onMove);
  const onMoveEndEvent = useEffectEvent(onMoveEnd);

  return useMemo(() => {
    return move({
      onMoveStart: onMoveStartEvent,
      onMove: onMoveEvent,
      onMoveEnd: onMoveEndEvent,
    }) as unknown as {
      moveProps: {
        onPointerDown: (e: React.PointerEvent) => void;
        onKeyDown: (e: React.KeyboardEvent) => void;
      };
    };
  }, [onMoveStartEvent, onMoveEvent, onMoveEndEvent]);
}
