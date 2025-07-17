import { useNavigate } from "react-router-dom";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { FaPlus } from "react-icons/fa";

const CreateCharacterCard = ({ onClick }) => {
  const { t } = useValidatedTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate("/characters/create");
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full border-2 border-dashed border-gray-300 hover:border-indigo-400"
      onClick={handleClick}
    >
      <CardBody className="p-4 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
        <div className="mb-4">
          <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
            <FaPlus className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        
        <Typography variant="h6" className="text-gray-600 mb-2">
          {t("characters.newCharacter")}
        </Typography>
        
        <Typography variant="small" className="text-gray-500 text-center">
          {t("characters.createCharacterDescription")}
        </Typography>
      </CardBody>
    </Card>
  );
};

export default CreateCharacterCard;
