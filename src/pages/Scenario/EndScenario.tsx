import { gql, useQuery } from '@apollo/client';
import { useNavigate, useParams } from "react-router-dom" 
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { getScore } from '@/utils/score';
import { getChrono } from '@/utils/chrono';

export const SCRIPT_DATA = gql`
  query FindScriptById($id: String!) {
    script(id: $id) {
      id
      ScriptStep {
        stepId
        lettre
      }
      Department {
        id
        name
          ColorSet {
            primary
            secondary
          }
      }
    }
  }
`

const EndScenarioPage = () => {
  const { depId, sceId } = useParams()
  console.log(depId);
  const { 
    data, 
    loading,
    error
  } = useQuery(SCRIPT_DATA, {
    variables: { id: sceId },
    skip: !depId,
  });

  const navigate = useNavigate();
  console.log(data);

  const getSecretWord = () => {
    if (!data || !data.script || !data.script.ScriptStep) return '';
    return data.script.ScriptStep.map((scriptStep: { lettre: any; }) => scriptStep.lettre).join('');
  };

  const secretWord = getSecretWord();
  console.log(secretWord);

  const handleNext = () =>{
    navigate(`/departments/${depId}`)
  }

  const score = getScore();
  const chrono = getChrono();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-white px-4 py-8 flex flex-col justify-between">
      <h1 className="text-4xl font-bold text-center" style={{ color: data.script.Department.ColorSet.primary }}>
        Scénario : {data.script.Department.name}
      </h1>
  
      <div className="flex flex-col items-center justify-center flex-1">
        <Trophy className="w-32 h-32" color={data.script.Department.ColorSet.primary} />
        <p className="text-3xl font-bold mt-4">Le mot secret est {secretWord}</p>
        <p className="p-3 text-2xl font-bold">Votre score : {score}</p>
        <div className="text-2xl font-bold ">
          Temps restant : {Math.floor(chrono / 60)}:
          {chrono % 60 < 10 ? '0' : ''}
          {chrono % 60}
        </div>
      </div>
  
      <motion.button 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="p-4 border-4 rounded-3xl font-bold text-2xl text-white w-full"
        style={{ backgroundColor: data.script.Department.ColorSet.secondary, borderColor: data.script.Department.ColorSet.primary }}
        onClick={handleNext}
      >
        Terminer
      </motion.button>
    </div>
  );
}  

export default EndScenarioPage;