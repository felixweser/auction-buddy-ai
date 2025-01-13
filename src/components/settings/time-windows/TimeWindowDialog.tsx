import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { TimeWindowForm } from "../TimeWindowForm";
import { useState } from "react";

interface TimeWindowDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  editingWindow: TimeWindow | null;
  onAdd: (startTime: string, endTime: string) => Promise<void>;
  onEdit: (startTime: string, endTime: string) => Promise<void>;
  onClose: () => void;
}

export function TimeWindowDialog({
  isOpen,
  onOpenChange,
  selectedDate,
  editingWindow,
  onAdd,
  onEdit,
  onClose,
}: TimeWindowDialogProps) {
  const [startTime, setStartTime] = useState(editingWindow?.window_start || "");
  const [endTime, setEndTime] = useState(editingWindow?.window_end || "");

  const handleSubmit = async () => {
    if (editingWindow) {
      await onEdit(startTime, endTime);
    } else {
      await onAdd(startTime, endTime);
    }
    resetForm();
  };

  const resetForm = () => {
    setStartTime("");
    setEndTime("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={() => {
          resetForm();
          onOpenChange(true);
        }}>
          Zeitfenster hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingWindow ? "Zeitfenster bearbeiten" : "Neues Zeitfenster hinzufügen"}
          </DialogTitle>
        </DialogHeader>
        <TimeWindowForm
          date={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
          startTime={startTime}
          endTime={endTime}
          onDateChange={() => {}} // Date is controlled by calendar
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          onSubmit={handleSubmit}
          isEditing={!!editingWindow}
        />
      </DialogContent>
    </Dialog>
  );
}