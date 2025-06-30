import { useNavigate } from 'react-router-dom';
import { Department } from "@exploregame/types";

interface BoutonExplorerProps {
    positionBas: boolean;
    urlRedirection?: string;
    department?: Department;
    bordercolor?: string;
    backgroundColor?: string;
}

const BoutonExplorer = ({positionBas, urlRedirection, bordercolor, backgroundColor, department}: BoutonExplorerProps) => {
  const navigate = useNavigate()

  if (positionBas) {
    const handleClick = () => {
        navigate(urlRedirection!);
    };

    return (
      <div className="flex justify-center items-center w-full sticky bottom-0 left-1/2 transform -translate-y-1/2">
        <button className="p-4 py-4 w-3/4 border-4 border-[#791860] rounded-3xl bg-[#BB8BAF] font-bold text-3xl text-white" onClick={handleClick}>
          Jouer
        </button>
      </div>
    )
  } else {
    const handleScript = () => {
      //TODO: resume or start scenario
      //TODO: redirect to the correct url
      navigate(`/departments/${department!.id}/scenarios/${department!.Script[0]!.id}`)
    }

    return (
      <div className="flex justify-center items-center w-full my-8">
        <button 
          className={`p-4 py-4 w-3/4 border-4 rounded-3xl font-bold text-3xl text-white`} 
          onClick={handleScript}
          style={{backgroundColor: backgroundColor, borderColor: bordercolor}}
        >
          Jouer
        </button>
      </div>
    )
  }
}

export default BoutonExplorer;