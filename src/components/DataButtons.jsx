import React from 'react';
import { Button } from './ui/Button';
import { Download, Upload } from 'lucide-react';

const DataButtons = ({ 
  onExportData, 
  onImportData 
}) => {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onExportData}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Esporta</span>
        <span className="sm:hidden">Export</span>
      </Button>
      
      <label className="cursor-pointer">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          asChild
        >
          <span className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Importa</span>
            <span className="sm:hidden">Import</span>
          </span>
        </Button>
        <input
          type="file"
          accept=".json"
          onChange={onImportData}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default DataButtons;
