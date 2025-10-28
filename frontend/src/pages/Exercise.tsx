import ExerciseCreateModal from "../components/Exercise/Modals/ExerciseCreateModal";
import ExerciseTable from "../components/Exercise/ExerciseTable";

type ExerciseCreateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const Exercise = ({ open, onOpenChange }: ExerciseCreateModalProps) => {
  return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 pr-20 tracking-wide">
                    Exercícios
                </h1>
                <ExerciseCreateModal openProp={open} />
            </div>

            <div className="">
                <ExerciseTable />
            </div>
        </div>
    );
};
export default Exercise;