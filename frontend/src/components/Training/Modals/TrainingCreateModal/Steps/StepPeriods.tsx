import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { periodNameSchema, TrainingCreateSchema } from "@/schemas/training";
import { cn } from "@/lib/utils";
import DeletePeriodDialog from "../../DeletePeriodDialog";

type Props = {
  periods: TrainingCreateSchema["periods"];
  onAddPeriod: (name: string) => void;
  onRemovePeriod: (id: number) => void;
  onUpdatePeriodName: (id: number, name: string) => void;
  isMobile: boolean;
};

export default function StepPeriods({
  periods,
  onAddPeriod,
  onRemovePeriod,
  onUpdatePeriodName,
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

  return (
    <div className="space-y-3">
      {/* ADD PERIOD */}
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

        <Button size="sm" onClick={handleAdd} disabled={!canAdd}>
          Adicionar
        </Button>
      </div>

      {/* PERIOD LIST */}
      <ul className="space-y-2">
        {periods.map((p) => {
          const isEditing = editingId === p.id;
          const isExpanded = expandedId === p.id;

          return (
            <li key={p.id} className="border rounded-md p-2 space-y-2">
              {/* HEADER */}
              <div
                className={cn(
                  "flex items-center justify-between",
                  isMobile && "cursor-pointer"
                )}
                onClick={() =>
                  isMobile && setExpandedId(isExpanded ? null : p.id)
                }
              >
                <div className="flex-1">
                  {isEditing ? (
                    <>
                      <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
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

                {/* DESKTOP ACTIONS */}
                {!isMobile && (
                  <div className="flex gap-1">
                    {!isEditing && (
                      <button onClick={() => startEdit(p.id, p.name)}>
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}

                    {isEditing && (
                      <>
                        <button onClick={confirmEdit} disabled={!canSaveEdit}>
                          <CheckIcon className="w-4 h-4 text-green-600" />
                        </button>
                        <button onClick={cancelEdit}>
                          <XIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() =>
                        setDeleteTarget({ id: p.id, name: p.name })
                      }
                    >
                      <TrashIcon className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
              </div>

              {/* MOBILE ACTIONS */}
              {isMobile && isExpanded && !isEditing && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => startEdit(p.id, p.name)}
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

              {/* MOBILE EDIT ACTIONS */}
              {isMobile && isEditing && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={cancelEdit}
                  >
                    Cancelar
                  </Button>

                  <Button
                    className="flex-1"
                    onClick={confirmEdit}
                    disabled={!canSaveEdit}
                  >
                    Salvar
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
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
