import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  GripVertical,
} from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { periodNameSchema, TrainingCreateSchema } from "@/schemas/training";
import { cn } from "@/lib/utils";
import DeletePeriodDialog from "../../DeletePeriodDialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function usePeriodsDndSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
}

type Props = {
  periods: TrainingCreateSchema["periods"];
  onAddPeriod: (name: string) => void;
  onRemovePeriod: (id: number) => void;
  onUpdatePeriodName: (id: number, name: string) => void;
  onReorderPeriods: (oldIndex: number, newIndex: number) => void;
  isMobile: boolean;
};

function PeriodRow({
  p,
  isEditing,
  isExpanded,
  editingValue,
  editError,
  canSaveEdit,
  isMobile,
  onRowClick,
  onStartEdit,
  onConfirmEdit,
  onCancelEdit,
  onEditingValueChange,
  setDeleteTarget,
}: {
  p: TrainingCreateSchema["periods"][number];
  isEditing: boolean;
  isExpanded: boolean;
  editingValue: string;
  editError: string | null;
  canSaveEdit: boolean;
  isMobile: boolean;
  onRowClick: () => void;
  onStartEdit: (id: number, name: string) => void;
  onConfirmEdit: () => void;
  onCancelEdit: () => void;
  onEditingValueChange: (value: string) => void;
  setDeleteTarget: (v: { id: number; name: string } | null) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: p.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "border rounded-md p-2 space-y-2",
        isDragging && "opacity-50 z-10"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2",
          isMobile && "cursor-pointer"
        )}
        onClick={() => isMobile && !isEditing && onRowClick()}
      >
        <div
          className="touch-none cursor-grab active:cursor-grabbing shrink-0 text-muted-foreground"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <>
              <Input
                value={editingValue}
                onChange={(e) => onEditingValueChange(e.target.value)}
                autoFocus
              />
              {editError && (
                <p className="mt-1 text-xs text-red-500">{editError}</p>
              )}
            </>
          ) : (
            <span className="w-full flex justify-between font-medium">
              {p.name}{" "}
              {isMobile &&
                (isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />)}
            </span>
          )}
        </div>

        {!isMobile && (
          <div className="flex gap-1 shrink-0">
            {!isEditing && (
              <button type="button" onClick={() => onStartEdit(p.id, p.name)}>
                <PencilIcon className="w-4 h-4 mr-2 cursor-pointer" />
              </button>
            )}

            {isEditing && (
              <>
                <button type="button" onClick={onConfirmEdit} disabled={!canSaveEdit}>
                  <CheckIcon className="w-4 h-4 mx-2 text-green-600 cursor-pointer" />
                </button>
                <button type="button" onClick={onCancelEdit}>
                  <XIcon className="w-4 h-4 mr-2 cursor-pointer" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setDeleteTarget({ id: p.id, name: p.name })}
            >
              <TrashIcon className="w-4 h-4 text-red-500 cursor-pointer" />
            </button>
          </div>
        )}
      </div>

      {isMobile && isExpanded && !isEditing && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onStartEdit(p.id, p.name)}
          >
            Editar
          </Button>

          <Button
            variant="destructive"
            className="flex-1 text-white border-none"
            onClick={() => setDeleteTarget({ id: p.id, name: p.name })}
          >
            Excluir
          </Button>
        </div>
      )}

      {isMobile && isEditing && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancelEdit}
          >
            Cancelar
          </Button>

          <Button
            className="flex-1"
            onClick={onConfirmEdit}
            disabled={!canSaveEdit}
          >
            Salvar
          </Button>
        </div>
      )}
    </li>
  );
}

export default function StepPeriods({
  periods,
  onAddPeriod,
  onRemovePeriod,
  onUpdatePeriodName,
  onReorderPeriods,
  isMobile,
}: Props) {
  const [newPeriod, setNewPeriod] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const addValidation = useMemo(
    () => periodNameSchema.safeParse(newPeriod.trim()),
    [newPeriod]
  );

  const addError =
    newPeriod.length > 0 && !addValidation.success
      ? addValidation.error.issues[0]?.message
      : null;

  const canAdd = addValidation.success;

  const handleAdd = () => {
    if (!canAdd) return;
    onAddPeriod(newPeriod.trim());
    setNewPeriod("");
  };

  const editValidation = useMemo(
    () => periodNameSchema.safeParse(editingValue.trim()),
    [editingValue]
  );

  const editError =
    editingValue.length > 0 && !editValidation.success
      ? editValidation.error.issues[0]?.message
      : null;

  const canSaveEdit = editValidation.success;

  const startEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingValue(name);
    setExpandedId(id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const confirmEdit = () => {
    if (!canSaveEdit || editingId === null) return;
    onUpdatePeriodName(editingId, editingValue.trim());
    cancelEdit();
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over == null || active.id === over.id) return;
      const oldIndex = periods.findIndex((p) => p.id === active.id);
      const newIndex = periods.findIndex((p) => p.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      onReorderPeriods(oldIndex, newIndex);
    },
    [periods, onReorderPeriods]
  );

  const periodIds = useMemo(() => periods.map((p) => p.id), [periods]);
  const sensors = usePeriodsDndSensors();

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Nome do período (ex: Treino A)"
            className="text-sm font-medium"
            value={newPeriod}
            onChange={(e) => setNewPeriod(e.target.value)}
          />
          {addError && (
            <p className="mt-1 text-xs text-red-500 font-medium">{addError}</p>
          )}
        </div>

        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!canAdd}
          className="cursor-pointer"
        >
          Adicionar
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={periodIds}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {periods.map((p) => {
              const isEditing = editingId === p.id;
              const isExpanded = expandedId === p.id;
              return (
                <PeriodRow
                  key={p.id}
                  p={p}
                  isEditing={isEditing}
                  isExpanded={isExpanded}
                  editingValue={editingValue}
                  editError={editError}
                  canSaveEdit={canSaveEdit}
                  isMobile={isMobile}
                  onRowClick={() => setExpandedId(isExpanded ? null : p.id)}
                  onStartEdit={startEdit}
                  onConfirmEdit={confirmEdit}
                  onCancelEdit={cancelEdit}
                  onEditingValueChange={setEditingValue}
                  setDeleteTarget={setDeleteTarget}
                />
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>
      <DeletePeriodDialog
        open={!!deleteTarget}
        periodName={deleteTarget?.name}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          onRemovePeriod(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
