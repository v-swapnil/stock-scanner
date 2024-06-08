"use client";

import { RiArrowUpSLine, RiArrowDownSLine } from "@remixicon/react";
import { Flex } from "@tremor/react";
import classNames from "classnames";
import { useState, useCallback, memo } from "react";

function SortableColumn({ id, title, start, onSortItems }: any) {
  const [sortDirection, setSortDirection] = useState("");

  const onChangeSort = useCallback(() => {
    const newSortDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newSortDirection);
    onSortItems(id, newSortDirection);
  }, [id, sortDirection, onSortItems]);

  return (
    <Flex
      justifyContent={start ? "start" : "end"}
      onClick={onChangeSort}
      className="cursor-pointer"
    >
      {title}
      <div className="-space-y-2 ml-2">
        <RiArrowUpSLine
          className={classNames(
            "h-4 w-4 text-tremor-content-strong dark:text-dark-tremor-content-strong",
            sortDirection === "desc" ? "opacity-30" : ""
          )}
          aria-hidden={true}
        />
        <RiArrowDownSLine
          className={classNames(
            "h-4 w-4 text-tremor-content-strong dark:text-dark-tremor-content-strong",
            sortDirection === "asc" ? "opacity-30" : ""
          )}
          aria-hidden={true}
        />
      </div>
    </Flex>
  );
}

export default memo(SortableColumn);
