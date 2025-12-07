"use client";

import { BadgeDelta } from "@tremor/react";
import { memo } from "react";

function MovingAverageBadge({ className, maPrice, maDiffPercentage }: any) {
  const deltaType =
    maDiffPercentage < 0.5 && maDiffPercentage > -0.5
      ? "unchanged"
      : maDiffPercentage >= 0.5
        ? "increase"
        : "decrease";
  return (
    <BadgeDelta className={className} deltaType={deltaType}>
      {maPrice} ({maDiffPercentage}%)
    </BadgeDelta>
  );
}

export default memo(MovingAverageBadge);
