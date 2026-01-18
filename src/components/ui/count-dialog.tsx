import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  maxCount?: number;
  onConfirm: (count: number) => void;
}

export function CountDialog({
  open,
  onOpenChange,
  title,
  description,
  maxCount = 10,
  onConfirm,
}: CountDialogProps) {
  const [count, setCount] = useState(1);

  const handleConfirm = () => {
    onConfirm(count);
    onOpenChange(false);
    setCount(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="count">{description}</Label>
          <Input
            id="count"
            type="number"
            min={1}
            max={maxCount}
            value={count}
            onChange={(e) => setCount(Math.min(maxCount, Math.max(1, parseInt(e.target.value) || 1)))}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Maksimalno: {maxCount}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Otkaži
          </Button>
          <Button onClick={handleConfirm}>
            Generiši
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
