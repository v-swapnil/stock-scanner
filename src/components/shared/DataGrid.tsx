import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

interface DataGridProps extends AgGridReactProps {
  height: number | string;
}

const DataGrid = ({ height, ...gridProps }: DataGridProps) => {
  return (
    <div className="ag-theme-quartz-dark" style={{ width: "100%", height }}>
      <AgGridReact {...gridProps} />
    </div>
  );
};

export default DataGrid;
