import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Department } from "@exploregame/types";
import { gql, useQuery } from "@apollo/client";

interface FiliereBoxProps {
}

const DEPARTMENTS = gql`
    query FindDepartments {
      departments {
        id
        name
        description
        Script {
          id
        }
        ColorSet {
          primary
          secondary
          tertiary
        }
      }
    }
  `

const FilieresBox = ({ }: FiliereBoxProps) => {
  

  const { 
    data,
    loading,
    error,
  } = useQuery(DEPARTMENTS)

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error</p>

  const departments = data.departments

  const navigate = useNavigate();

  const handleCardClick = (id: string) => {
    navigate(`/departments/${id}`);
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-3 px-5 my-5">
      <p className="text-3xl font-bold text-[#555454] text-start w-full">Les départements</p>
      <div className='flex flex-wrap justify-center gap-3 bg-[#bb8baf] p-3 rounded-lg shadow'>
        {departments.map((departement: Department, index: number) => (
            <Card key={index} 
            className="bg-[#bb8baf] cursor-pointer w-full" 
            style={{ backgroundColor: departement.ColorSet.primary, borderColor: '#FFF'}} 
            onClick={() => handleCardClick(departement.id)}
            >
                <CardContent>
                    <CardTitle className='font-bold my-4 text-2xl' style={{ color: '#FFF' }}>{departement.name}</CardTitle>
                    <CardDescription className='text-xl' style={{ color: '#FFF' }}>{departement.description}</CardDescription>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
};

export default FilieresBox;