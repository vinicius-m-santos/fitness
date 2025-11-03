import { useMediaQuery } from "react-responsive";
import ExerciseTable from "./ExerciseTable";
import ExerciseCards from "./ExerciseCards";

export const ExerciseList = ({ exerciseTableData, loading }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return isMobile ? (
    <ExerciseCards exerciseTableData={exerciseTableData} loading={loading} />
  ) : (
    <ExerciseTable exerciseTableData={exerciseTableData} loading={loading} />
  );
};
